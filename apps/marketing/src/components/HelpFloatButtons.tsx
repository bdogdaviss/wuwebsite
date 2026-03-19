'use client'

import { QuestionCircleOutlined } from '@ant-design/icons'
import { FloatButton } from 'antd'

export function HelpFloatButtons() {
  return (
    <FloatButton
      icon={<QuestionCircleOutlined />}
      type="primary"
      style={{ insetInlineEnd: 24 }}
    />
  )
}
