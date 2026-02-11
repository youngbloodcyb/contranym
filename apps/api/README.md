## Development

```
bun i
vc dev
```

```
open http://localhost:3000/
```

## Auth Environment Variables

```
BETTER_AUTH_SECRET=replace-me
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://...
```

## Password Auth Endpoints

Create a user with email/password:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "password1234",
    "name": "Dev User",
    "firstName": "Dev",
    "lastName": "User"
  }'
```

Sign in:

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "password1234"
  }'
```

## Deploy

```
vc deploy
```
