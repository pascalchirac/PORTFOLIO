import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the professional portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>EPEY Pascal Chirac — Technicien NOC &amp; Support IT N2<\/title>/i);
  assert.match(html, /SICPA TOGO/);
  assert.match(html, /10 sites industriels/);
  assert.match(html, /Mars 2025 — Mai 2025 · Mission clôturée/);
  assert.match(html, /Depuis janvier 2025 · Missions saisonnières/);
  assert.match(html, /Consultant technique — Réseaux, systèmes &amp; supervision/);
  assert.match(html, /NOC opérationnel/);
  assert.match(html, /SOC en construction/);
  assert.match(html, /Orientation SOC/);
  assert.match(html, /FTTH \/ FTTx \/ GPON — montée en compétence/);
  assert.match(html, /DUT en Génie mécanique et productique/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps the authenticated career additions in both site versions", async () => {
  const [page, staticPage, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../docs/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const source of [page, staticPage]) {
    assert.match(source, /SICPA TOGO/);
    assert.match(source, /AS PHARM TOGO/);
    assert.match(source, /École Supérieure des Services Numériques|ESSN/);
    assert.match(source, /BRAIN FACTORY SARL/);
    assert.match(source, /BAHAAU Technologies Consulting/);
    assert.match(source, /DUT en Génie mécanique et productique/);
  }

  assert.match(staticPage, /Stages techniques/);
  assert.match(staticPage, /Commission Électorale Nationale Indépendante/);
  assert.match(staticPage, /Nouvelle Société Cotonnière du Togo/);
  assert.match(staticPage, /Mars 2025 — Mai 2025/);
  assert.match(staticPage, /Mission clôturée en mai 2025/);
  assert.match(staticPage, /Missions saisonnières de consultant/);
  assert.match(staticPage, /Consultant technique — Réseaux, systèmes & supervision/);
  assert.match(staticPage, /Seuls l’adresse e-mail et le consentement sont obligatoires/);
  assert.doesNotMatch(staticPage, /Mars 2025 — Aujourd’hui/);
  assert.match(layout, /EPEY Pascal Chirac — Technicien NOC & Support IT N2/);
  assert.match(staticPage, /data-filter="NOC \/ Supervision"/);
  assert.match(staticPage, /og-noc-soc\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
