
# Sedotgan

Sedotgan is a crawler API to get content from another website with ease. Build with NodeJS, x-ray, and puppeteer to get DOM content (optionally).

  

Sedotgan is running as REST API, you can crawl any website with call HTTP and use parameters to get content from the website.

  

## Running REST API

**Installation**

  

-  ```git clone https://github.com/LordAur/sedotgan.git```

-  ```cd sedotgan```

- Run ```npm install``` or ```yarn```

**Running REST API**

- Run ```npm start```

- Open ```http://localhost:3000``` the default port is 3000, but you can change it to whatever you want. You just create a .env and set PORT

  

## Usage

Sedotgan only have 1 endpoint that is ```http://localhost:3000/crawling``` with **GET** method. To crawl a website, you should use a query parameter like url and data.

**Example**

```

http://localhost:3000/crawling?url=https://github.com&data={"title":"title"}

```

```

Results

{

"title": "The title was here"

}

```

The example above shows how to get a HTML title from github.com. To get the HTML content you want, you should write the element in parameter data. You can see the [x-ray documentation](https://github.com/matthewmueller/x-ray) to see how to write HTML elements for crawling.

  

The data parameter you can use JSON string, array or just string. The output results follow parameter data. For example you want to get an images with array format.

```

http://localhost:3000/crawling?url=https://whatever.com&data={"images":["img@src"]}

```

```

Results

{

"images": [

"https://whatever.com/1.jpg"

]

}

```

Or you can use

```

http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}

```

```

Results

[

"https://whatever.com/1.jpg"

]

```

### Crawl dynamic content

To crawl the dynamic content from React, Vue, Svelte, or Jquery, you cannot use an x-ray as a driver, you must use Puppeteer.

To use Puppeteer to crawl the dynamic content, you should use puppeteer parameter in url like this:

```

http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}&puppeteer=true

```

The Puppeteer would generate the static HTML content and will crawl the data by x-ray.

  

### Paginate dynamic content

If you want to get data from paginate website, you should use paginate as the query parameter like this:

```

http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}&puppeteer=true&paginate=true

```

If you know the end of the paginate, you can use paginateLimit as a query parameter to stop crawl after the end of page.

```

http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}&puppeteer=true&paginate=true&paginateLimit=5

```

  

But if you don't know how much page it is, you can use paginateClick, you should check the HTML element, where the element to open the next page.

  

To stop the paginate, you should use paginateEnd to set a condition of the HTML element on the end page. For example, on the end page, the next button has a disabled class or whatever. The crawl will be stopped if has a condition.

```

http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}&puppeteer=true&paginate=true&paginateClick=".next-button"&paginateEnd=".disabled.next-button"

```

### Download as zip file
If you want to download some file from the website and make it batch, you can download it as a zip file. Added download query paramater like this:
```
http://localhost:3000/crawling?url=https://whatever.com&data=["img@src"]}&puppeteer=true&paginate=true&paginateClick=".next-button"&paginateEnd=".disabled.next-button"&download=true
```

You can use custom filename with use filename query parameter.

## Notes

I will improve this project to serve a good and easier crawl server. If you found a bug, you can create an issue in Github.

  

## License

  

Copyright [Yudha Pratama Wicaksana](https://github.com/LordAur), Licensed under [MIT](./LICENSE).