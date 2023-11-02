THREE.JS + React + TypeScript (React-Three-Fiber)

I should update this, but fow now if you want to use it just: 
1. npm install
2. npm run dev or npm run build
3. From "tsconfig.json", remove/comment out:
  "exclude": [
    "src"
  ],

This tells Vite to ignores all the typescript error messages and I can build/depoloy on Vercel. ( Should fix it in the future tho )
