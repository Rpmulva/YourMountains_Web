# Deploy this project to dougheindel/yomo

## 1. Create the new repo on GitHub

1. Go to **https://github.com/new**
2. Repository name: **yomo**
3. Owner: **dougheindel**
4. Choose Public (or Private).
5. **Do not** initialize with a README, .gitignore, or license (this project already has them).
6. Click **Create repository**.

## 2. Add the new remote and push

From the project root (`CAC-Platform`), run:

```bash
# Add your new repo as a remote named "yomo"
git remote add yomo https://github.com/dougheindel/yomo.git

# Commit any uncommitted changes first (if you want them in the new repo)
git add -A
git status   # review
git commit -m "Your message"

# Push the current branch to the new repo (creates 'main' on GitHub if it doesn't exist)
git push -u yomo main
```

If the new repo already has a default branch (e.g. `main`) and you get an error, use:

```bash
git push -u yomo main --force
```

only if you intend to overwrite whatever is there.

## 3. Optional: make yomo the default remote

If you want `git push` to go to dougheindel/yomo by default:

```bash
git remote rename origin cac-platform
git remote rename yomo origin
git push -u origin main
```

Then `origin` is dougheindel/yomo and the old repo is `cac-platform`. Pull from CAC-Platform with `git pull cac-platform main` when needed.
