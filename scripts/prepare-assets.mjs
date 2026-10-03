import { copyFile, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const manifest = JSON.parse(await readFile('scripts/asset-manifest.json', 'utf8'));

await mkdir('public/images', { recursive: true });
await mkdir('public/fonts', { recursive: true });
await mkdir('public/licenses', { recursive: true });
const fonts = [
  ['@fontsource-variable/inter', 'inter-latin-wght-normal.woff2'],
  ...[500, 600, 700, 800].map(weight => ['@fontsource/poppins', `poppins-latin-${weight}-normal.woff2`])
];
for (const [pkg, file] of fonts) await copyFile(`node_modules/${pkg}/files/${file}`, `public/fonts/${file}`);
for (const pkg of ['@fontsource-variable/inter', '@fontsource/poppins']) {
  await copyFile(`node_modules/${pkg}/LICENSE`, `public/licenses/${pkg.split('/').at(-1)}.txt`);
}
await copyFile('node_modules/@fortawesome/free-solid-svg-icons/LICENSE.txt', 'public/licenses/fontawesome.txt');
const packs = {
  solid: require('@fortawesome/free-solid-svg-icons'), regular: require('@fortawesome/free-regular-svg-icons'), brands: require('@fortawesome/free-brands-svg-icons')
};
// The source's Wikimedia URL returns 404. Use a local licensed Google glyph.
const google = packs.brands.faGoogle.icon;
await writeFile('public/images/google-g.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${google[0]} ${google[1]}"><path fill="#4285f4" d="${google[4]}"/></svg>`);
const symbols = manifest.icons.map(id => {
  const [style, ...parts] = id.split('-');
  const name = parts.join('-');
  const definition = Object.values(packs[style]).find(value => value?.icon && (value.iconName === name || value.icon[2].includes(name)));
  if (!definition) throw new Error(`Missing icon: ${id}`);
  const [width, height, , , paths] = definition.icon;
  return `<symbol id="${id}" viewBox="0 0 ${width} ${height}">${[paths].flat().map(path => `<path d="${path}"/>`).join('')}</symbol>`;
});
await writeFile('public/icons.svg', `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`);

const images = [...manifest.images];
const hero = images.find(image => image.filename.includes('photo-1522071820081'));
images.push({ ...hero, filename: 'hero-640.webp', width: 640, height: 480 }, { ...hero, filename: 'hero-1600.webp', width: 1600, height: 1200 });
images.push({ ...hero, filename: 'social-cover.webp', width: 1200, height: 630 });
images.push({ filename: 'services-background.webp', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d', width: 1200, height: 800 });
// Limit concurrent image downloads; assets are committed and ordinary builds need no network.
for (let offset = 0; offset < images.length; offset += 4) {
  await Promise.all(images.slice(offset, offset + 4).map(async image => {
    const target = `public/images/${image.filename}`;
    try { await access(target); return; } catch { /* Download missing assets. */ }
    const url = new URL(image.url);
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('fm', 'webp'); url.searchParams.set('q', '75');
      url.searchParams.set('w', String(image.width)); url.searchParams.set('h', String(image.height));
    }
    let response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (response.status === 404 && url.pathname === '/photo-1576091160550-2173ff9e5eb3') {
      // The medical-coding stock photo in the supplied source has been removed.
      url.pathname = '/photo-1576091160399-112ba8d25d1d';
      response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    }
    if (!response.ok) throw new Error(`Image download failed: ${url.pathname} (${response.status})`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    console.log(`Saved ${image.filename}`);
  }));
}
console.log(`Prepared ${manifest.icons.length} SVG icons and local fonts and images.`);
