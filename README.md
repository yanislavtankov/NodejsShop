# NodejsShop - Full Stack E-Commerce Application

A complete, lightweight e-commerce solution built with Node.js, Express, TypeScript, and MySQL. This project features a public-facing shop with a shopping cart and checkout system, as well as a comprehensive admin panel for managing products, categories, and orders.

## Table of Contents

1. [Installation](#installation)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Frontend](#frontend)
5. [Technology Usage](#technology-usage)
6. [Testing](#testing)

---

## 1. Installation

Follow these steps to set up and run the system locally.

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (Node Package Manager)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd NodejsShop
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Database Setup**
    - Create a new MySQL database (e.g., `minishop`).
    - Import the schema from `schema.sql` to create the necessary tables (`products`, `categories`, `orders`, `order_items`).
    ```bash
    mysql -u root -p minishop < schema.sql
    ```

4.  **Environment Configuration**
    - Create a `.env` file in the root directory (copy from `.env.example`).
    - Configure your database credentials and admin user.
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=minishop
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=secret
    ```

5.  **Run the Server**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3000`.

---

## 2. Architecture

The store follows a classic **Client-Server** architecture with a **RESTful API**.

### Backend (`server/`)
-   **Runtime**: Node.js with TypeScript.
-   **Framework**: Express.js for handling HTTP requests and routing.
-   **Database**: MySQL, interacting via the `mysql2` library with connection pooling.
-   **Structure**:
    -   `index.ts`: Entry point, middleware configuration, and static file serving.
    -   `routes/`: API route definitions (`api.ts` for public, `admin.ts` for protected).
    -   `db.ts`: Database connection pool configuration.

### Frontend (`public/` & `admin/`)
-   **Technology**: Vanilla HTML, CSS, and JavaScript.
-   **Serving**: Static files are served directly by the Express server.
-   **Logic**: Client-side JavaScript handles dynamic content rendering, state management (cart), and API communication.

---

## 3. API Endpoints

The API is divided into Public (`/api/*`) and Admin (`/api/admin/*`) namespaces.

### Public Endpoints (`server/routes/api.ts`)

| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get all categories | None |
| `GET` | `/api/products` | Get products with filtering | `q` (search), `category` (slug), `min_price`, `max_price`, `page`, `limit` |
| `GET` | `/api/products/:slug` | Get single product details | `slug` (URL param) |
| `POST` | `/api/orders` | Create a new order | Body: `{ items: [], customer: {} }` |
| `GET` | `/api/orders/track` | Track an order | `code`, `email` (query params) |

### Admin Endpoints (`server/routes/admin.ts`)

*Note: All admin endpoints require authentication (cookie-based).*

| Method | Endpoint | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Admin login | Body: `{ username, password }` |
| `POST` | `/api/admin/logout` | Admin logout | None |
| `POST` | `/api/admin/upload-image` | Upload product image | `image` (multipart/form-data) |
| `GET` | `/api/admin/orders` | Get all orders | None |
| `PATCH` | `/api/admin/orders/:id/status` | Update order status | Body: `{ status }` |
| `POST` | `/api/admin/products` | Create product | Body: Product fields |
| `PATCH` | `/api/admin/products/:id` | Update product | Body: Product fields |
| `DELETE` | `/api/admin/products/:id` | Delete product | None |
| `POST` | `/api/admin/categories` | Create category | Body: `{ name, slug, parent_id }` |

---

## 4. Front End of the Shop

The frontend is built with **Vanilla JavaScript** for maximum performance and zero build-step complexity.

### Public Shop (`public/`)
-   **`index.html`**: Homepage, displays featured products.
-   **`product.html`**: Detailed product view with images and description.
-   **`search.html`**: Advanced search and filtering interface.
-   **`cart.html`**: Shopping cart view.
-   **`checkout.html`**: Checkout form.
-   **`js/app.js`**: Core logic. Handles fetching products, rendering grids, search functionality, and global event listeners.
-   **`js/cart.js`**: Manages the shopping cart state using `localStorage`. Handles adding/removing items and calculating totals.

### Admin Panel (`admin/`)
-   **`index.html`**: Single-page dashboard for administrators.
-   **`js/admin.js`**: Contains all admin logic.
    -   **Authentication**: Checks login status on load.
    -   **Dashboard**: Tabs for Products, Categories, and Orders.
    -   **CRUD**: Forms and tables to Create, Read, Update, and Delete data via the API.

---

## 5. How JavaScript and Node.js were used

### Node.js (Server-Side)
Node.js serves as the backbone of the application, providing a high-performance, non-blocking environment.
-   **Express Framework**: Used to create the web server, manage routing, and serve static files.
-   **Middleware**: `cookie-parser` for auth, `express.json` for parsing bodies, and `multer` for handling file uploads.
-   **Database Integration**: Uses `mysql2/promise` to execute SQL queries asynchronously using `async/await` syntax, ensuring the server remains responsive.
-   **TypeScript**: Provides type safety (interfaces for `Product`, `Order`, etc.) to reduce runtime errors.

### JavaScript (Client-Side)
Vanilla JavaScript brings the static HTML pages to life.
-   **DOM Manipulation**: Dynamically creates HTML elements (e.g., product cards, table rows) based on data fetched from the API.
-   **Fetch API**: Used extensively to communicate with the backend asynchronously (AJAX). This allows the page to update content without a full reload (SPA-like feel).
-   **LocalStorage**: Used to persist the shopping cart data in the user's browser, so items remain in the cart even after refreshing the page.
-   **Event Handling**: Listeners for clicks, form submissions, and input changes drive the user interaction (e.g., "Add to Cart", "Search", "Filter").

---

## 6. Testing

The project includes a comprehensive testing suite covering unit, integration, and performance testing.

### Running Tests

| Command | Description |
| :--- | :--- |
| `npm test` | Run all unit and integration tests using Jest. |
| `npm run test:unit` | Run only unit tests. |
| `npm run test:integration` | Run only integration tests. |
| `npm run test:load` | Run performance/load tests using Artillery. |

### Test Structure

-   **Unit Tests** (`tests/unit/`): Test individual utility functions and isolated logic.
-   **Integration Tests** (`tests/integration/`): Test API endpoints using `supertest` with mocked database connections.
-   **Performance Tests** (`tests/performance/`): Load testing scenarios defined in `load-test.yml` to simulate user traffic.

