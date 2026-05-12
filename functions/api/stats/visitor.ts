import { queryOne, execute } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Return current visitor stats
    const activeCount = await queryOne(context.env.DB,
      'SELECT COUNT(*) as count FROM VisitorSession WHERE isActive = 1 AND lastActive > datetime("now", "-5 minutes")'
    );
    return json({ activeVisitors: (activeCount as any)?.count || 0 });
  } catch (e) {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as {
      sessionId?: string; page?: string; referrer?: string;
    };

    const sessionId = body.sessionId || crypto.randomUUID();
    const page = body.page || '/';
    const referrer = body.referrer || null;

    const existing = await queryOne(context.env.DB,
      'SELECT id FROM VisitorSession WHERE sessionId = ?', [sessionId]
    );

    if (existing) {
      await execute(context.env.DB,
        'UPDATE VisitorSession SET lastActive = datetime("now"), isActive = 1, page = ? WHERE sessionId = ?',
        [page, sessionId]
      );
    } else {
      const id = crypto.randomUUID();
      await execute(context.env.DB, `
        INSERT INTO VisitorSession (id, sessionId, page, referrer, isActive, lastActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 1, datetime("now"), datetime("now"), datetime("now"))
      `, [id, sessionId, page, referrer]);
    }

    return json({ sessionId });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
