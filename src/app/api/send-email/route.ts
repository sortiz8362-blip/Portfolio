import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Para pruebas, asumimos que el usuario no tiene dominio verificado y usamos `onboarding@resend.dev`
    // Enviamos el correo a LA MISMA CUENTA con la que se registró en Resend para que no falle
    const data = await resend.emails.send({
      from: "Portfolio Admin <notificaciones@profile.saov.page>",
      to: ["cavich2006@gmail.com"], // Idealmente esto debería ser tu correo para recibir notificaciones, pero para probar Resend te obliga a enviar a la cuenta verificada. Por ahora lo enviaremos al email configurado pero lo ideal sería una variable de entorno. Modificaremos esto para enviar a un MAIL fijo o al email provisto si es desarrollo.
      subject: `Nuevo mensaje de ${name} desde tu Portafolio`,
      html: `
        <h2>Tienes un nuevo mensaje de tu Portafolio</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
        <br/>
        <a href="mailto:${email}?subject=Respuesta a tu mensaje de portafolio">Responder a ${name}</a>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al enviar email:", error);
    return NextResponse.json({ error: "Error enviando el correo" }, { status: 500 });
  }
}
