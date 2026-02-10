import { api } from './api'
import { getEnabled, setLastRulesSync } from './storage'

interface BlockRule {
  id: string
  pattern: string
  enabled: boolean
}

// Convert a pattern to DNR rule format
function patternToDNRRule(pattern: string, id: number): chrome.declarativeNetRequest.Rule {
  // Clean up pattern - remove protocol if present
  let urlFilter = pattern
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')

  // If it's a simple domain, use requestDomains
  const isDomain = /^[a-zA-Z0-9.-]+$/.test(urlFilter) && !urlFilter.includes('/')

  if (isDomain) {
    return {
      id,
      priority: 1,
      action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        requestDomains: [urlFilter],
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
        ],
      },
    }
  }

  // Otherwise use urlFilter
  return {
    id,
    priority: 1,
    action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
    condition: {
      urlFilter: `*://*${urlFilter}*`,
      resourceTypes: [
        chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
      ],
    },
  }
}

// Fetch rules from API and apply them
export async function syncRules(): Promise<void> {
  const enabled = await getEnabled()

  // Get current dynamic rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingIds = existingRules.map((r) => r.id)

  if (!enabled) {
    // Remove all rules when disabled
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
      })
    }
    return
  }

  // Fetch rules from API
  let rules: BlockRule[] = []
  try {
    const response = await api.listBlockRules()
    rules = response.rules.filter((r) => r.enabled)
  } catch (err) {
    console.error('Failed to fetch block rules:', err)
    return
  }

  // Convert to DNR format (start IDs at 1)
  const dnrRules = rules.map((rule, index) => patternToDNRRule(rule.pattern, index + 1))

  // Update rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: dnrRules,
  })

  await setLastRulesSync(Date.now())
  console.log(`Synced ${dnrRules.length} block rules`)
}

// Clear all blocking rules
export async function clearRules(): Promise<void> {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingIds = existingRules.map((r) => r.id)

  if (existingIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
    })
  }
}

// Get count of active rules
export async function getRuleCount(): Promise<number> {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  return rules.length
}
