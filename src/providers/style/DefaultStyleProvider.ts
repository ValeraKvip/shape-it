import StyleProvider from "./StyleProvider";

export class DefaultStyleProvider implements StyleProvider {
  getCSSImports(): string {
    return '';
  }
  getDarkThemeStyle(): string {

    return `
        <script>        
          import '../admin.css';
          let { children } = $props();
        </script>

        {@render children()}

        <svelte:head>
          <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />              
        </svelte:head>
        `
  }
  getLightThemeStyle(): string {
    return `
      <script>
          let { children } = $props();
        </script>
        
        {@render children()}
    `
    return `
        <script>
          let { children } = $props();
        </script>
        
        {@render children()}

        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
      
          form {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            box-sizing: border-box;
          }
      
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
          }
      
          input, textarea, select {
            width: 100%;
            padding: 8px;
            margin-bottom: 16px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
      
          textarea {
            resize: vertical;
          }
      
          button {
            background-color: #4caf50;
            color: #fff;
            padding: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
      
          button:hover {
            background-color: #45a049;
          }

                    table {            
            border-collapse: collapse; 
            margin:5px auto;
            }

          /* Zebra striping */
          tr:nth-of-type(odd) { 
            background: #eee; 
            }

          th { 
            background: #3498db; 
            color: white; 
            font-weight: bold; 
            }

          td, th { 
            padding: 10px; 
            border: 1px solid #ccc; 
            text-align: left; 
            font-size: 18px;
            }
            </style>
            </svelte:head>
        `
  }

}