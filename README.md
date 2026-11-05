              Demo accounts (after seed):
              
              - Admin: `admin@school.local` / `Admin123!`
              - Kitchen manager: `chef@school.local` / `Chef123!`
              - Students (password for all: `Student123`):
                - `student@school.local` — Иван Петров
                - `maria@school.local` — Мария Сидорова
                - `alex@school.local` — Алексей Козлов
                - `elena@school.local` — Елена Волкова
                - `dmitry@school.local` — Дмитрий Орлов
                - `sofia@school.local` — София Морозова
              
              Seed creates 50 dishes, 50 orders, 7 menus, 35 favorites, 7 users (1 admin + 6 students).
              
              ## Quick Start
              
              ### 1) Backend
              
              1. Install dependencies:
                 - `cd backend`
                 - `npm install`
              2. Configure environment:
                 - copy `.env.example` to `.env`
                 - set PostgreSQL connection string
                 - configure SMTP variables for e-mail sending (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
              3. Run migrations:
                 - `npx prisma migrate dev`
              4. Seed database (10+ records):
                 - `npm run prisma:seed`
              5. Start backend:
                 - `npm run dev`
              
              ### 2) Frontend
              
              1. Install dependencies:
                 - `cd frontend`
                 - `npm install`
              2. Start dev server:
                 - `npm run dev`
              3. Open browser:
                 - `http://localhost:3000`
              
       ## Лицензия
       
       Учебная версия проекта распространяется как **Freeware** на условиях пользовательского соглашения [EULA.txt](EULA.txt). Программа может использоваться бесплатно в личных, учебных и иных некоммерческих целях. Это **не Open Source**: права на модификацию, коммерческое использование, перепродажу и распространение исходного кода без письменного разрешения правообладателя не предоставляются.       
