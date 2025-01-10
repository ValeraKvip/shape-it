<p align="center">
  <img src="assets/logo.png" width="180px" align="center" alt="Shape-it logo" />
  <h1 align="center">Shape It</h1>
  <p align="center">Shape your application in the config file and instantly get a generated MVP or a solid foundation for further development!</p>
</p>


# Why
Have you ever found yourself in a situation where you need to develop a a cutting-edge🤑 feature? For example, you have to create a ChatGPT API application that analyzes user sentences, shows them errors, and explains the grammatical rules. Then you realize it would be great to have a UI🤔, so you create one. But you also need a database to store the dialogue contexts—you get sidetracked🤨 by that, and now you need API endpoints to connect everything together😟. Now you find yourself  writing unit tests😠 to finally stop testing manually, but now you’re testing for multiple users, and you need authentication😤, so you implement that. Then another developer joins you and asks for API documentation—now you’re writing😡 documentation for the API. Finally, you think😊 you can get back to... writing input validation🤬. You were supposed to be working on a cutting-edge feature, but hours, days (months?😱) have gone by, and you’re dealing with completely different tasks! And then, when you finally present your MVP, it crashes☠️ at the most critical moment! Why? Because you tested it differently than how users would actually use🤪 it and simply didn’t anticipate that.

This is why this project exists—you just `shape` the desired structure of the application in a config file, and the package, even at the generation stage, will notify you of potential issues and how to fix them😎. Then it will generate in a few seconds😇 what would have taken days—you can calmly implement your feature without worrying about everything else.🤝

[![Watch the video](https://img.youtube.com/vi/GBrKCFD1RXI/0.jpg)](https://www.youtube.com/watch?v=GBrKCFD1RXI)
## Video 👆 [See on YouTube](https://www.youtube.com/watch?v=GBrKCFD1RXI)


# Feature list
- Validation of the future application even at the generation stage
- Generation of CRUD API for databases.
- Validation of input data and forms using ZOD.
- Generation of a CMS admin panel.
- Generation of API endpoints.
- Generation of API documentation according to the OpenAPI (Swagger) standard.
- Generation of client-side pages.
- Generation of unit tests.
- Generation of authentication.
- Generation of an API for an image storage.
- Generation of a sitemap.


# Get started
1. [Create](https://svelte.dev/docs/kit/creating-a-project) a new SvelteKit application.
```
npx sv create my-app
cd my-app
npm install    
```

2. Install [Shape-it via npm](https://svelte.dev/docs/kit/creating-a-project)
```
npm install shape-it
```

3. In the root of the project, create a file `shape-it.js`.
```javascript
import {ShapeIt} from 'shape-it';

ShapeIt({      
    book:{
        $id:{
            type:'string'
        },

        name:{
            type:'string',
            min:10,
            max:500
        },

        description:{
            type:'string',
            max:1024,
            optional:true
        },
        zipCode:{
            type:"string",
            length:9
        },
        authors:{
            type:"Author[]",
            array:{
                max:10
            }
        }
        ...
    },

    Author:{
        $id:{
            type:'number'
        },
        name:{
            type:"string",
        }
    }
    ...
})
```

4. Open `package.json` and add the following command to section "scripts". 
```json
{    
    "scripts":{
       "shape-it":"node shape-it.js",       
    }
}
```

5. Run
```
npm run shape-it
```

6. Fix errors. When done, run:
```
npm run dev
```

7. Open webiste and go to `/admin` and explore.
```
login: admin
password: admin
```

8. Go to `/api` and explore.
9. Back to code. Open `docs/swagger.json` Copy.<br>
Navigate to https://editor-next.swagger.io/ and paste.