import { Router } from "express";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import path from "path";
import { getDashboardStats } from "../services/stats.js";
import { MEAL_TYPE_LABELS } from "../services/menuWeek.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
const router = Router();
// Register a font that supports Cyrillic (Arial on Windows)
const ARIAL_FONT_PATH = path.join(process.env.WINDIR || "C:\\Windows", "Fonts", "arial.ttf");
function createMailTransporter() {
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s/g, "").trim();
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    if (!user || !pass) {
        throw new Error("SMTP_USER and SMTP_PASS must be set in .env");
    }
    if (host === "smtp.gmail.com") {
        return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    }
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}
function createMenuWeekPdfBuffer(stats) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const doc = new PDFDocument({ margin: 50 });
        doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
        const { overview, currentWeek } = stats;
        const genDate = new Date(stats.generatedAt).toLocaleString("ru-RU");
        // Register Arial font for Cyrillic support
        doc.registerFont("Arial", ARIAL_FONT_PATH);
        doc.font("Arial");
        doc.fontSize(20).text("МЕНЮ НА НЕДЕЛЮ — ШКОЛЬНАЯ СТОЛОВАЯ", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#555555").text(`Сформировано: ${genDate}`);
        doc.fillColor("#000000");
        doc.moveDown();
        doc.fontSize(14).text("ОБЩАЯ СТАТИСТИКА");
        doc.fontSize(11);
        doc.text(`Блюд в каталоге: ${overview.totalDishes}`);
        doc.text(`Категорий: ${overview.totalCategories}`);
        doc.text(`Дней с меню: ${overview.totalMenus}`);
        doc.text(`Недель с меню: ${overview.menuWeeks}`);
        doc.text(`Полных дней на текущей неделе: ${overview.completeDaysThisWeek}/7`);
        doc.moveDown();
        doc.fontSize(14).text(`НЕДЕЛЯ ${currentWeek.weekStart} — ${currentWeek.weekEnd}`);
        doc.fontSize(11);
        for (const day of currentWeek.days) {
            doc.text(`${day.dayName} ${day.date}${day.isComplete ? "" : " (неполное)"}`);
            for (const mealType of ["BREAKFAST", "LUNCH", "SNACK"]) {
                const dishes = day.meals[mealType].map((d) => d.name).join(", ") || "—";
                doc.text(`  ${MEAL_TYPE_LABELS[mealType]}: ${dishes}`);
            }
            doc.moveDown(0.3);
        }
        doc.end();
    });
}
async function createMenuCoverageDocxBuffer(stats) {
    const { overview, popularDishes, categoryStats, last7Days } = stats;
    const genDate = new Date(stats.generatedAt).toLocaleString("ru-RU");
    const header = (text) => new Paragraph({
        spacing: { before: 300, after: 120 },
        children: [new TextRun({ text, bold: true, size: 28 })]
    });
    const line = (text) => new Paragraph({ children: [new TextRun({ text, size: 22 })] });
    const popularTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: ["№", "Блюдо", "Категория", "В меню раз"].map((h) => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
                }))
            }),
            ...popularDishes.map((d, i) => new TableRow({
                children: [String(i + 1), d.dishName, d.category, String(d.count)].map((cell) => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cell })] })]
                }))
            }))
        ]
    });
    const reportDoc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Отчёт по меню — Школьная столовая", bold: true, size: 32 })
                        ]
                    }),
                    line(`Дата формирования: ${genDate}`),
                    line(""),
                    header("Сводка"),
                    line(`Блюд в каталоге: ${overview.totalDishes}`),
                    line(`Дней с меню: ${overview.totalMenus}`),
                    line(`Полных дней на текущей неделе: ${overview.completeDaysThisWeek}`),
                    line(`Записей в избранном: ${overview.totalFavorites}`),
                    line(""),
                    header("Частота блюд в меню"),
                    popularTable,
                    line(""),
                    header("Категории"),
                    ...categoryStats.map((c) => line(`${c.categoryName}: ${c.dishCount} блюд, ${c.menuAppearances} вхождений в меню`)),
                    line(""),
                    header("Покрытие за 7 дней"),
                    ...last7Days.map((d) => line(`${d.date}: ${d.hasMenu ? (d.isComplete ? "полное меню" : "неполное") : "нет меню"}, блюд: ${d.dishCount}`))
                ]
            }
        ]
    });
    return Packer.toBuffer(reportDoc);
}
router.get("/dashboard", authRequired, roleRequired(["admin"]), async (_req, res, next) => {
    try {
        return res.json(await getDashboardStats());
    }
    catch (error) {
        return next(error);
    }
});
router.get("/menu-summary", authRequired, roleRequired(["admin"]), async (_req, res, next) => {
    try {
        const stats = await getDashboardStats();
        return res.json({
            overview: stats.overview,
            last7Days: stats.last7Days,
            currentWeek: stats.currentWeek
        });
    }
    catch (error) {
        return next(error);
    }
});
router.get("/popular-dishes", authRequired, roleRequired(["admin"]), async (_req, res, next) => {
    try {
        const stats = await getDashboardStats();
        return res.json({
            popularDishes: stats.popularDishes,
            categoryStats: stats.categoryStats
        });
    }
    catch (error) {
        return next(error);
    }
});
router.get("/menu-week.pdf", authRequired, roleRequired(["admin"]), async (_req, res, next) => {
    try {
        const stats = await getDashboardStats();
        const buffer = await createMenuWeekPdfBuffer(stats);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=menu-week.pdf");
        return res.send(buffer);
    }
    catch (error) {
        return next(error);
    }
});
router.get("/menu-coverage.docx", authRequired, roleRequired(["admin"]), async (_req, res, next) => {
    try {
        const stats = await getDashboardStats();
        const buffer = await createMenuCoverageDocxBuffer(stats);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", "attachment; filename=menu-coverage.docx");
        return res.send(buffer);
    }
    catch (error) {
        return next(error);
    }
});
router.post("/send-email", authRequired, roleRequired(["admin"]), async (req, res, next) => {
    try {
        const { email, reportType } = req.body;
        if (!email || !reportType) {
            return res.status(400).json({ message: "email and reportType are required" });
        }
        const transporter = createMailTransporter();
        const smtpUser = process.env.SMTP_USER?.trim();
        const from = process.env.SMTP_FROM?.trim() || smtpUser;
        if (!from)
            return res.status(500).json({ message: "SMTP configuration is missing" });
        const stats = await getDashboardStats();
        if (reportType === "menu") {
            const pdf = await createMenuWeekPdfBuffer(stats);
            await transporter.sendMail({
                from,
                to: email,
                subject: "Школьная столовая — меню на неделю",
                text: `Меню на неделю ${stats.currentWeek.weekStart} — ${stats.currentWeek.weekEnd}`,
                attachments: [{ filename: "menu-week.pdf", content: pdf }]
            });
        }
        else {
            const docx = await createMenuCoverageDocxBuffer(stats);
            await transporter.sendMail({
                from,
                to: email,
                subject: "Школьная столовая — отчёт по покрытию меню",
                text: `Полных дней на текущей неделе: ${stats.overview.completeDaysThisWeek}`,
                attachments: [{ filename: "menu-coverage.docx", content: docx }]
            });
        }
        return res.json({ message: "Report sent successfully", email, reportType });
    }
    catch (error) {
        return next(error);
    }
});
export default router;
