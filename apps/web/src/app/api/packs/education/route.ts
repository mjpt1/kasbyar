import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import {
  createCourse,
  createCourseEnrollment,
  listCourseEnrollments,
  listCourses,
} from '@/server/packs/education/education.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('EDUCATION');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'courses';
    const page = Number(searchParams.get('page') ?? 1);

    if (mode === 'enrollments') {
      const status = searchParams.get('status') ?? undefined;
      const data = await listCourseEnrollments(auth.session.organizationId, { status, page });
      return jsonResponse(apiSuccess(data));
    }

    const data = await listCourses(auth.session.organizationId, { page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'education.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('EDUCATION');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const mode = body.mode ?? 'course';

    if (mode === 'enrollment') {
      if (!body.courseId || !body.customerId) {
        return jsonResponse(
          { success: false, error: { code: 'VALIDATION', message: 'courseId و customerId الزامی است' } },
          400,
        );
      }
      const enrollment = await createCourseEnrollment(auth.session.organizationId, {
        courseId: body.courseId,
        customerId: body.customerId,
        status: body.status ?? 'ENROLLED',
      });
      return jsonResponse(apiSuccess(enrollment), 201);
    }

    if (!body.title) {
      return jsonResponse(
        { success: false, error: { code: 'VALIDATION', message: 'title الزامی است' } },
        400,
      );
    }

    const course = await createCourse(auth.session.organizationId, {
      title: body.title,
      instructor: body.instructor,
      capacity: body.capacity ?? 20,
      price: body.price,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isActive: body.isActive ?? true,
    });

    return jsonResponse(apiSuccess(course), 201);
  } catch (error) {
    return handleApiError(error, 'education.POST');
  }
}
