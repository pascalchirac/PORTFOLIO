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
  assert.match(html, /<title>EPEY Pascal Chirac — Support IT N2<\/title>/i);
  assert.match(html, /SICPA TOGO/);
  assert.match(html, /10 sites industriels/);
  assert.match(html, /AS PHARM TOGO/);
  assert.match(html, /BRAIN FACTORY SARL/);
  assert.match(html, /BAHAAU Technologies Consulting/);
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
  assert.match(layout, /EPEY Pascal Chirac — Support IT N2/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
