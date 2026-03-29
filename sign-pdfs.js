import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Native env usage
const SIGNATURE_TEXT = process.env.SIGNATURE_TEXT ?? 'Signed';
const FONT_SIZE = Number(process.env.FONT_SIZE ?? 12);
const POS_X = Number(process.env.POS_X ?? 400);
const POS_Y = Number(process.env.POS_Y ?? 50);

async function processPDF(filePath, outputPath) {
    const existingPdfBytes = fs.readFileSync(filePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
        page.drawText(SIGNATURE_TEXT, {
            x: POS_X,
            y: POS_Y,
            size: FONT_SIZE,
            font,
            color: rgb(0, 0, 0),
        });
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
}

async function main() {
    if (!fs.existsSync(INPUT_DIR)) {
        throw new Error(`Input folder not found: ${INPUT_DIR}`);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    const files = fs.readdirSync(INPUT_DIR);

    for (const file of files) {
        if (path.extname(file).toLowerCase() === '.pdf') {
            const inputPath = path.join(INPUT_DIR, file);
            const outputPath = path.join(OUTPUT_DIR, file);

            console.log(`Processing: ${file}`);
            await processPDF(inputPath, outputPath);
        }
    }

    console.log('Done!');
}

main().catch(console.error);