import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

export const authGuard = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.$jwt.pipe(
    tap((value) => (value == null ? router.navigate(['/login']) : true))
  );
};
