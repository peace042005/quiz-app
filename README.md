# 🧠 QuizMaster — Jeu de Quiz Interactif

> Application full-stack de quiz interactif avec gestion complète via un panel administrateur.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

## Fonctionnalités

### Joueur
- Inscription et connexion sécurisée
- Choix de catégorie de quiz
- Quiz de 10 questions aléatoires avec timer
- Feedback immédiat + explication après chaque réponse
- Bonus de rapidité
- Score final avec médaille
- Classement général top 20
- Historique des parties

### Administrateur
- Tableau de bord avec statistiques
- CRUD complet des catégories
- CRUD complet des questions avec réponses multiples
- Définition de la bonne réponse
- Paramétrage difficulté / points / temps
- Liste et stats des joueurs

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Backend | Laravel 11 |
| Auth | Laravel Sanctum |
| Base de données | MySQL 8 |
| Frontend | React 18 |
| State | Zustand |
| HTTP | Axios |
| CSS | Tailwind CSS 3 |
| Build | Vite 5 |

---

## Installation

### Prérequis
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL 8+

### 1. Cloner

```bash
git clone https://github.com/VOTRE_USERNAME/quiz-app.git
cd quiz-app
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configurer `.env` :
```env
DB_DATABASE=quizmaster
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

```bash
php artisan migrate
php artisan serve
```

### 3. Créer le compte admin

```bash
php artisan tinker
```
```php
App\Models\User::create([
    'name' => 'Administrateur',
    'email' => 'admin@quiz.com',
    'password' => bcrypt('admin123'),
    'role' => 'admin',
]);
exit
```

### 4. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## Accès

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Application joueur |
| http://localhost:5173/admin | Panel administrateur |

---

## API Routes

### Publiques
- POST `/api/register`
- POST `/api/login`
- GET  `/api/categories`

### Joueur (token requis)
- POST `/api/quiz/start`
- POST `/api/quiz/submit-answer`
- POST `/api/quiz/finish`
- GET  `/api/quiz/history`
- GET  `/api/leaderboard`

### Admin (role admin requis)
- GET/POST `/api/admin/categories`
- GET/POST `/api/admin/questions`
- GET      `/api/admin/dashboard`
- GET      `/api/admin/users`

---

## Déploiement

### Backend — Railway ou Render
1. Connecter le dépôt GitHub
2. Configurer les variables d'environnement
3. Build : `composer install --no-dev`
4. Start : `php artisan serve --host=0.0.0.0 --port=$PORT`

### Frontend — Vercel ou Netlify
1. Importer le dossier `frontend/`
2. Build command : `npm run build`
3. Output : `dist`
4. Variable : `VITE_API_URL=https://votre-backend.up.railway.app/api`

---

Fait avec ❤️ — QuizMaster 2026
