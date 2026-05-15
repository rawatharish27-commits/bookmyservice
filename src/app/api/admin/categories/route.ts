import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can create categories' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description, iconUrl, icon, parentId, displayOrder, seoTitle, seoDescription } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.serviceCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const category = await db.serviceCategory.create({
      data: {
        name,
        slug,
        description,
        iconUrl,
        icon,
        parentId: parentId ? parseInt(parentId) : null,
        displayOrder: displayOrder || 0,
        seoTitle,
        seoDescription,
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'CREATE_CATEGORY',
        targetType: 'CATEGORY',
        targetId: String(category.id),
        details: JSON.stringify({ name, slug }),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can update categories' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, slug, description, iconUrl, icon, parentId, displayOrder, isActive, seoTitle, seoDescription } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await db.serviceCategory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (icon !== undefined) updateData.icon = icon;
    if (parentId !== undefined) updateData.parentId = parentId ? parseInt(parentId) : null;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    const updatedCategory = await db.serviceCategory.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'UPDATE_CATEGORY',
        targetType: 'CATEGORY',
        targetId: String(id),
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
