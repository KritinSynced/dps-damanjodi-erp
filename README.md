# Delhi Public School (DPS), Damanjodi — ERP Portal

A unified, modern cloud-based Enterprise Resource Planning (ERP) platform designed for **Delhi Public School (DPS), Damanjodi**. This system digitizes and integrates daily school operations, scheduling, role-based user management, classroom diagnostics, library tracking, attendance bookkeeping, leave pipelines, and academic grading metrics.

By providing dedicated portal dashboards, the system replaces manual ledgers, spreadsheet files, and physical paper notice-boards with a seamless, role-enforced workspace.

---

## 🏗️ System Architecture & Stack

The platform is designed as a secure, cross-platform client-server application supporting web and mobile environments:

*   **Frontend Web App**: Built with **Next.js 16** (React 19, Tailwind CSS v4, Lucide Icons, and Recharts for visual analytics). Authentication is managed by **Clerk** supporting secure JWT sessions and Google OAuth.
*   **Mobile App Framework**: Powered by **Capacitor**, sharing 100% of the responsive web codebase to deliver native Android (v8.0+) and iOS (v15.0+) applications.
*   **API Gateways (Dual-Backend)**:
    *   **Node.js Server**: Express.js with TypeScript and Prisma Client, providing ACID-compliant database interactions.
    *   **Python Server**: FastAPI with Python 3.10+ providing high-performance, asynchronous endpoints.
*   **Database Tier**: Uses a central PostgreSQL database hosted on **Supabase** for production deployment, and a local **SQLite** database (`dev.db`) for offline and development work. All database accesses are abstracted through **Prisma ORM**.

---

## ✨ Key Functional Modules

### 1. Identity & Access Management (RBAC)
*   Enforces strict Role-Based Access Control (RBAC) across four roles: **Admin**, **Teacher**, **Student**, and **Parent**.
*   Customized registration pipelines linking user authentication profiles to database records (e.g., Admission Numbers for Students, Employee IDs for Teachers).
*   Role-targeted redirects ensuring each user lands on their designated custom portal dashboard.

### 2. Attendance Tracking & Alert Engine
*   Enables teachers to log daily or subject-specific attendance (Present, Absent, Late, Half-Day).
*   Logs records under composite unique keys `[studentId, date, subject]`.
*   Generates automatic notifications for parents if their child is marked absent.

### 3. Grade Book & Academic Management
*   Teachers upload marks for individual theory and practical exams (Unit Tests, Mid-Terms, Finals).
*   The system automatically calculates total percentages, GPA metrics, and standard letter grades (A1, B2, etc.).
*   Generates digital report cards for students and parents.
*   Grade-locking system prevents modifications after administrative sign-off.

### 4. Digital Library Management
*   Digitizes books cataloging with title, author, ISBN, category, shelf location, and copy availability.
*   Simplifies book checkout linking to Student Library Card Numbers (supports barcode scanner & camera QR-code scans).
*   Automatic fine engine tracks due dates and accumulates overdue penalties.

### 5. Leave Application Pipeline
*   Streamlined request forms where users input dates and justification arguments.
*   Structured review states: Class Teachers approve/reject student leaves, while Administrators handle faculty leave applications.
*   Real-time status updates on applicant dashboards.

### 6. Centralized Announcement Engine
*   Administrators and teachers post targeted announcements filtered by role (`ALL`, `Student`, `Teacher`, `Parent`) and category (`ACADEMIC`, `EVENT`, `GENERAL`, `URGENT`).
*   High-priority or Urgent notices are pinned to the top of target user portals.

## 🔒 Security & Performance Features

*   **Bcrypt Hashing**: All password credentials are salted and hashed using standard bcrypt algorithms.
*   **Role Enforcement Middleware**: Next.js route protection and backend authorization checkers ensure users cannot access dashboards or endpoints outside their permitted role.
*   **Secure Transport**: All APIs run over HTTPS/TLS. Supabase database connections use encrypted SSL certificates.
*   **Performance Metrics**: Dashboard widgets are cached and optimized to achieve sub-1.5s load times. The gateway scale accommodates up to 200 concurrent requests during busy peak attendance periods.
