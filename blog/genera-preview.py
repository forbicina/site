#!/usr/bin/env python3
"""Rigenera le preview dei post nelle pagine di archivio mensili.

Per ogni post linkato in archive/20*.html, risale al testo sorgente in texts/,
ne estrae il contenuto testuale e lo taglia a MAX_CARATTERI sull'ultima parola
intera. Riscrive solo la preview: titolo, data e tutto il resto restano intatti.

Uso:  python3 genera-preview.py
"""

import glob
import html
import os
import re

MAX_CARATTERI = 400

BLOG = os.path.dirname(os.path.abspath(__file__))


def testo_sorgente(slug_post):
    """Da post/<slug>.html risale al file in texts/ che quel post carica."""
    pagina = open(os.path.join(BLOG, "post", slug_post + ".html"), encoding="utf-8").read()
    m = re.search(r"'(texts/[\w-]+\.html)'", pagina)
    if not m:
        return None
    return os.path.join(BLOG, m.group(1))


def estrai(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'<h4.*?</h4>', ' ', s, flags=re.S)                  # titolo del post
    s = re.sub(r'<p[^>]*>\s*posted on[^<]*</p>', ' ', s)            # riga della data
    s = re.sub(r'<sup>.*?</sup>', '', s, flags=re.S)                # rimandi alle note
    s = re.sub(r'<details.*?</details>', ' ', s, flags=re.S)        # spoiler
    s = re.sub(r'<p[^>]*>\s*\d+\).*?</p>', ' ', s, flags=re.S)      # note a pie' di pagina
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return " ".join(html.unescape(s).split())


def taglia(testo, n=MAX_CARATTERI):
    if len(testo) <= n:
        return testo
    return testo[:n].rsplit(" ", 1)[0].rstrip(" ,;:.") + "..."


# titolo + data, poi la preview fino al <br> di chiusura
BLOCCO = re.compile(
    r'(<a href="post/([\w-]+)\.html">.*?</a></h5>\s*\n'
    r'\s*<p[^>]*>posted on[^<]*</p>\n)'
    r'(\s*)(.*?)(<br>)',
    re.S,
)


def aggiorna(pagina):
    src = open(pagina, encoding="utf-8").read()
    contati = []

    def sostituisci(m):
        intestazione, slug, indent, _vecchia, chiusura = m.groups()
        sorgente = testo_sorgente(slug)
        if not sorgente:
            print(f"  ! {slug}: nessun testo sorgente, lasciato invariato")
            return m.group(0)
        nuova = taglia(estrai(sorgente))
        contati.append((slug, len(nuova)))
        return intestazione + indent + nuova + chiusura

    nuovo = BLOCCO.sub(sostituisci, src)
    if nuovo != src:
        open(pagina, "w", encoding="utf-8").write(nuovo)
    for slug, n in contati:
        print(f"  {slug}: {n} caratteri")


for pagina in sorted(glob.glob(os.path.join(BLOG, "archive", "20*.html"))):
    print(os.path.basename(pagina))
    aggiorna(pagina)
