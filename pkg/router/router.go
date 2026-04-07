package router

import (
	"net/http"

	"z01.ascii-art-web/pkg/handlers"
)

func Routes() http.Handler {
	h := handlers.NewHandlers()

	mux := http.NewServeMux()

	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	mux.HandleFunc("/", h.Home)
	mux.HandleFunc("/ascii-art", h.AsciiArt)
	mux.HandleFunc("/contact", h.Contact)
	mux.HandleFunc("/about", h.About)
	mux.HandleFunc("/generator", h.Generator)

	return mux
}
