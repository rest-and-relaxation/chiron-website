from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent.parent / 'site'), **kwargs)

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path == '/site' or url.path.startswith('/site/'):
            path = url.path.removeprefix('/site') or '/'
            if path == '/v2' or path.startswith('/v2/'):
                path = '/'
            self.send_response(302)
            self.send_header('Location', urlunsplit(('', '', path, url.query, url.fragment)))
            self.end_headers()
            return
        super().do_GET()


print('Chiron local preview: http://localhost:4173/', flush=True)
ThreadingHTTPServer(('127.0.0.1', 4173), WebsiteHandler).serve_forever()
