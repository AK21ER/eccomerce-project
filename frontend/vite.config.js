import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
     proxy:{
          "/api":{                                // and the reason why we used /api is to say that anything any route that is starting with api will bw proxy to the backend which means sended for the backend else it will stayes in the react server
            target:"http://localhost:5000",       ///this is used as a cours in the back end it is more useful for the removing the course error the same as adding course in the backend



       }
    }
  }
})
