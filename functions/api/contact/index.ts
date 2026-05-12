import { execute } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { name, email, subject, message } = await context.request.json() as {
      name: string; email: string; subject: string; message: string;
    };

    if (!name || !email || !subject || !message) {
      return error('All fields are required', 400);
    }

    const id = crypto.randomUUID();
    await execute(context.env.DB, `
      INSERT INTO ContactMessage (id, name, email, subject, message, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, 0, datetime("now"))
    `, [id, name, email, subject, message]);

    return json({ message: 'Message sent successfully' }, 201);
  } catch (e) {
    return error('Internal server error', 500);
  }
};
