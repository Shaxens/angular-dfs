import jwt_decode from 'jwt-decode';

export function getUserIdFromLocalStorage(): number | null {
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    const decodedToken: any = jwt_decode(jwt);
    if (decodedToken && decodedToken.user_id) {
      return decodedToken.user_id;
    }
  }
  return null;
}
