package handler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"wakeup/api/internal/model"
)

// ResolveAvatarURL replaces an object_key stored in avatar_url with a proxy URL
// that routes through the API server, so clients don't need direct MinIO access.
func ResolveAvatarURL(r *http.Request, profile *model.Profile) {
	if profile.AvatarURL == nil || *profile.AvatarURL == "" {
		return
	}
	// If it looks like an object key (contains "/") and isn't already a full URL, build a proxy URL
	if strings.Contains(*profile.AvatarURL, "/") && !strings.HasPrefix(*profile.AvatarURL, "http") {
		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}
		avatarURL := fmt.Sprintf("%s://%s/files/avatar?key=%s", scheme, r.Host, url.QueryEscape(*profile.AvatarURL))
		profile.AvatarURL = &avatarURL
	}
}
