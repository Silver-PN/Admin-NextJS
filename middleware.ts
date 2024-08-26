import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const PROTECTED_ROUTES = ['/dashboard'];
// const PROTECTED_ROUTES = [
//   '/user_rp',
//   '/role-permissions',
//   '/permissions',
//   '/roles'
// ];
const ROLE_SPECIFIC_PERMISSION = ['/dashboard/roles/'];

async function authenticate(request: NextRequest) {
  return await getToken({
    req: request,
    secret: NEXTAUTH_SECRET
  });
}

function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const token = await authenticate(request);
    if (!token) {
      return new NextResponse('Vui lòng đăng nhập để truy cập', {
        status: 401
      });
    } else if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
  }
  if (pathname === '/') {
    const token = await authenticate(request);
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  const isProtectRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  // const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);
  const isRoleSpecificPermission = ROLE_SPECIFIC_PERMISSION.some((role) =>
    pathname.startsWith(role)
  );

  if (isProtectRoute || isRoleSpecificPermission) {
    const token = await authenticate(request);
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isRoleSpecificPermission) {
      const requiredPermissions = ['admin'];
      const userPermissions = token.permissions || [];

      if (hasAnyPermission(userPermissions, requiredPermissions)) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
