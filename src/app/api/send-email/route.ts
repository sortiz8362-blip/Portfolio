import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Portfolio Admin <onboarding@resend.dev>";
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || "cavich2006@gmail.com";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

    const data = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [RESEND_TO_EMAIL],
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al enviar email:", error);
    return NextResponse.json({ error: "Error enviando el correo" }, { status: 500 });
  }
}
