# Conlang Dictionary

A web app to store and share your conlangs (constructed languages).

Read more about conlangs at [conlang.org](https://conlang.org).

## Table of Contents

- [TODO](#todo)
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Deployment](#deployment)
- [Contributing](#contributing)
- [Learn More](#learn-more)
- [Acknowledgements](#acknowledgements)

## TODO

### Conlang Dictionary MVP

- [x] Add ability for users to create conlangs
- [ ] Add simple dashboard to view and manage conlangs
  - [x] Dashboard shows create form if none created, otherwise shows a button to create a new conlang
  - [x] Add description to conlang data
  - [ ] Users can edit conlang to change name, description, and public status
- [ ] Landing page shows a list of recent public conlangs
  - [ ] New query to get most recent public conlangs
  - [ ] Use react table visiblity to hide unwanted columns from conlang table?
- [ ] Users can add words
- [ ] Users can tag conlang and words with custom tags

### Misc Details

- [ ] Maybe create users table with data from clerk and tie it to the conlang table
  - [ ] Then pull user info from conlang table join instead of react query

## Features

- **Create and manage conlangs:** Users can add multiple conlangs, each with a lexicon and grammar rules.
- **Share conlangs:** Conlangs can be publicly shared with others to view, download, or collaborate on.
- **Responsive design:** Accessible from any device, providing a consistent experience on desktops, tablets, and mobile.

## Technologies

This project uses the following technologies:

- **[Next.js](https://nextjs.org)**: The React framework for production.
- **[Tailwind CSS](https://tailwindcss.com)**: A utility-first CSS framework for rapid UI development.
- **[PostgreSQL](https://www.postgresql.org/)**: The world's most advanced open source relational database.
- **[Drizzle](https://orm.drizzle.team/)**: A lightweight and performant TypeScript ORM.
- **[Vercel](https://vercel.com)**: Platform for frontend frameworks and static sites, integrated with GitHub for continuous deployment.
- **[Clerk](https://clerk.dev)**: Easy-to-use authentication and user management that works out of the box with Next.js.
- **[Sentry](https://sentry.io)**: Error tracking and monitoring for production.

## Getting Started

Get a local copy of this project up and running by following these steps:

### Prerequisites

Make sure you have the following technologies installed on your system:

- [Git](https://github.com/git-guides/install-git)
- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [VS Code](https://code.visualstudio.com)

You'll need a postgres database to run this project. You can use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) for free.

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/charliedevs/conlang-dictionary.git
   cd conlang-dictionary
   ```
   > **Note:** Consider forking this project on GitHub to simplify local development and deployment. In that case, replace the url above with the url of your own forked repo. You can set up a vercel account for free and connect it to your own github repo hosting a fork of this project.
2. **Install depedencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   Copy `.env.example` to a new file called `.env` and populate it with your actual data. (You should also copy the contents of your `.env` file into your vercel project.)

   > **Note:** Never commit secrets directly to the repository. Always use environment variables and keep sensitive data out of your codebase.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Navigate to **`http://localhost:3000`**. The app wil automatically reload if you change any of the source files.

### Deployment

This project is configured for deployment on Vercel, which simplifies deploying Next.js apps. To deploy:

1. **Push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Add a meaningful commit message describing your changes"
   git push origin main # or another branch
   ```
2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
   - Click on "New Project" and select your repository.
   - Set up environment variables from your `.env` file into your project (under Settings).
   - Click on Storage under your project and "Create Database" (this project uses Postgres)
   - Connect your Vercel project to your new database

Vercel will automatically build and deploy your app when changes are pushed to your repository.

## Contributing

This is an open-source project. Any contributions you make are **greatly appreciated.**

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## Learn More

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

If you are not familiar with the different technologies used in this project, please refer to the respective docs.

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## Acknowledgements

This project couldn't have been created without the direction of Jessie Peterson and David Peterson, along with the amazing community of conlangers at LangTime Studio. Check out their content below:

- [LangTime Studio (YouTube)](https://www.youtube.com/c/LangTimeStudio)
- [LangTime Chat](https://chat.langtimestudio.com)
- [LangTime Patreon](https://www.patreon.com/langtimestudio)

<small>
Copyright © 2024 Charles Davis

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
</small>
