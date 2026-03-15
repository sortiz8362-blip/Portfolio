import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM_EMAIL = "Portfolio Admin <onboarding@resend.dev>";
const DEFAULT_TO_EMAIL = "cavich2006@gmail.com";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  const hasDoubleQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasSingleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  if (hasDoubleQuotes || hasSingleQuotes) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Falta RESEND_API_KEY en las variables de entorno");
      return NextResponse.json({ error: "Configuracion de email incompleta" }, { status: 500 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
    const fromEmail = normalizeEnvValue(process.env.RESEND_FROM_EMAIL) || DEFAULT_FROM_EMAIL;
    const toEmail = normalizeEnvValue(process.env.RESEND_TO_EMAIL) || DEFAULT_TO_EMAIL;

    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Nuevo mensaje de ${name} desde tu Portafolio`,
      html: `
        <h2>Tienes un nuevo mensaje de tu Portafolio</h2>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${safeMessage}</p>
        <br/>
        <a href="mailto:${safeEmail}?subject=Respuesta a tu mensaje de portafolio">Responder a ${safeName}</a>
      `,
    });

    if (data.error) {
      console.error("Resend error:", data.error);
      return NextResponse.json({ error: data.error.message || "Error enviando correo" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al enviar email:", error);
    return NextResponse.json({ error: "Error enviando el correo" }, { status: 500 });
  }
}
