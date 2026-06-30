# Nearby Hub — Backend (Express + MongoDB)

## Setup

```bash
npm install
cp .env.example .env   # already done for you — just review/edit the values
npm run dev
```

Requires MongoDB running and reachable at `MONGO_URI` (see `.env`).

## Folder structure

```
server.js                  entry point
src/
  config/db.js             mongoose connection
  models/                  User, Shop, Product, Message, Order
  middleware/
    auth.js                protect (JWT) + authorize (role check)
    errorHandler.js        404 + centralized error responses
  controllers/              business logic per resource
  routes/                   route -> controller wiring
  utils/generateToken.js    JWT signing helper
```

## Auth

All protected routes expect:

```
Authorization: Bearer <token>
```

The token is returned from `POST /api/auth/login`.

Roles: `user`, `owner`, `admin`. Registration enforces the same rule the
original frontend had — only one `admin` account can ever exist, and `owner`
accounts start with `approved: false` until an admin approves them.

## API reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create an account (`name`, `email`, `password`, `role`) |
| POST | `/login` | – | Returns `{ token, user }` |
| GET | `/me` | any | Returns the current user's fresh data |

### Users — `/api/users` (admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all users |
| PATCH | `/:email/approve` | Approve a pending shop-owner account |

### Shops — `/api/shops`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?verified=true&location=text` | – | Public listing, used by the User dashboard |
| GET | `/pending` | admin | Shops awaiting verification |
| GET | `/me` | owner | The logged-in owner's own shop |
| POST | `/` | owner | Create/update the owner's shop (upserts; preserves `verified`) |
| PATCH | `/:email/verify` | admin | Mark a shop as verified |

### Products — `/api/products`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | admin | All products, across all shops |
| GET | `/mine` | owner | The logged-in owner's products |
| GET | `/shop/:email` | – | Public: browse one shop's products |
| POST | `/` | owner | Add a product (shop must be `verified` first) |
| PATCH | `/:id/quality` | admin | Set `Good` / `Average` / `Poor` |
| DELETE | `/:id` | owner (own) or admin | Remove a product |

### Messages — `/api/messages`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | – | Public contact form submission |
| GET | `/` | admin | List all messages |

### Orders — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | user | Place an order (`shopEmail`, `shopName`, `items`, `paymentMethod`) |
| GET | `/mine` | user | The logged-in user's own order history |

### Health
`GET /api/health` → `{ status: "ok" }`
