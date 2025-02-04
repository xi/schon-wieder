import * as sass from 'sass';
import { readFileSync, writeFileSync } from 'node:fs';
import express from 'express';

process.chdir(import.meta.dirname);

if (process.argv[2] === 'dev') {
	const app = express();
	app.get('/', (req, res) => {
		res.send(build());
	});
	app.use(express.static('../docs', {}));
	app.listen(8080, () => {
		console.log('Server started on http://localhost:8080');
	});
} else {
	writeFileSync('../docs/index.html', build(), 'utf8');
}

function build(): string {
	let content = readFileSync('../template/text.html', 'utf8');
	content = content.replace(/(\w*)\[(.*?)\/(.*?)\](\w*)/gs, (_, pre: string, alt: string, neu: string, post: string) => {
		pre = pre.trim();
		alt = alt.trim();
		neu = neu.trim();
		post = post.trim();

		let style = '';
		if (alt.startsWith('$')) {
			alt = alt.slice(1);
			style = ' style="text-align: left"';
		} else if (neu.endsWith('$')) {
			neu = neu.slice(0, -1);
			style = ' style="text-align: right"';
		}

		let html = `<span class="switch"${style}><span>${alt.trim()}</span><br><span>${neu.trim()}</span></span>`;
		if (pre || post) {
			html = `<nobr>${pre}${html}${post}</nobr>`;
		}
		return html;
	});

	const style = sass.compile('../template/main.scss', { style: 'compressed' }).css;

	let template = readFileSync('../template/template.html', 'utf8');
	template = template.replace('/*style*/', style);
	template = template.replace('<!--content-->', content);
	return template;
}
