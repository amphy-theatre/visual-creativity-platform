
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/20ea082f-9932-476d-9844-cbe7450d0fed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/20ea082f-9932-476d-9844-cbe7450d0fed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Option 1: Using Lovable
Simply open [Lovable](https://lovable.dev/projects/20ea082f-9932-476d-9844-cbe7450d0fed) and click on Share -> Publish.

### Option 2: Deploying to Vercel with a custom domain

1. **Create a Vercel account** if you don't have one already at [vercel.com](https://vercel.com)

2. **Install the Vercel CLI** (optional but recommended):
   ```
   npm install -g vercel
   ```

3. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

4. **Deploy to Vercel**:
   - Connect your Git repository to Vercel through their dashboard
   - Or use the CLI: 
     ```
     vercel
     ```
   - Follow the prompts to link your project

5. **Connect your custom domain**:
   - Go to your project in the Vercel dashboard
   - Navigate to "Settings" > "Domains"
   - Add your domain (e.g., amphytheatre.com)
   - Follow Vercel's instructions to update your DNS settings:
     - Typically, you'll need to add an A record pointing to Vercel's IP
     - Or use nameservers provided by Vercel

6. **Configure DNS records**:
   - Log in to your domain registrar (where you purchased amphytheatre.com)
   - Update the DNS records as specified by Vercel
   - This generally includes adding an A record or CNAME record, or changing nameservers

7. **Verify domain ownership** (if required):
   - Vercel may ask you to verify domain ownership
   - Follow their instructions to add a TXT record to your DNS

8. **Wait for DNS propagation**:
   - DNS changes can take 24-48 hours to fully propagate
   - Vercel will automatically provision an SSL certificate for your domain

### Notes about Supabase functions

If you're using Supabase Edge Functions in this project, you'll need to:

1. Update your Supabase project settings to allow requests from your custom domain
2. Set the appropriate environment variables in your Vercel project for Supabase integration

For more help, refer to the [Vercel Documentation](https://vercel.com/docs) and [Supabase Documentation](https://supabase.com/docs).
