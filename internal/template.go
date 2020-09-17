package internal

// Template func
func Template() string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <base href="<%= base %>">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <%= if (len(content["title"]) > 0) { %>
        <title><%= content["title"] %> by <%= profile["name"] %></title>
    <% } else { %>
        <title><%= profile["name"] %></title>
    <% } %>
    <meta name="generator" content="Moul <%= version %>">
    <link rel="preload" href="assets/moul.0c839.js" as="script">
    <link rel="preload" href="assets/moul.0c839.css" as="style">
    <%= if (favicon == "true"){ %>
    <link rel="alternate icon" class="favicon-alternate" type="image/png" href="">
    <link rel="icon" type="image/svg+xml" href="favicon/favicon.svg">
    <script>
        const alternate = document.querySelector('.favicon-alternate');
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            alternate.href= 'favicon/favicon-dark.png';
        } else {
            alternate.href= 'favicon/favicon-light.png';
        }
    </script>
    <% } %>
    <meta name="twitter:card" content="summary_large_image" />
    <%= if (len(social["twitter"]) > 0 ) { %>
        <meta name="twitter:creator" content="@<%= social["twitter"] %>" />
    <% } %>

    <meta property="og:url" content="<%= base %>" />
    <meta property="og:type" content="website" />
    <%= if (len(content["title"]) > 0) { %>
        <meta property="og:title" content="<%= content["title"] %>" />
        <meta name="twitter:title" content="<%= content["title"] %>" />
    <% } %>
    <%= if (len(content["text"]) > 0) { %>
        <meta property="og:description" content="<%= content["text"] %>" />
        <meta name="twitter:description" content="<%= content["text"] %>">
    <% } %>
    <meta property="og:image" content="<%= base %>photos/<%= cover["id"] %>/cover/1280/<%= cover["name"] %>.jpg" />
    <meta name="twitter:image" content="<%= base %>photos/<%= cover["id"] %>/cover/1280/<%= cover["name"] %>.jpg" />
    
    <style>
        :root {
            --font: -apple-system, BlinkMacSystemFont, 'San Francisco', Ubuntu, 'Google Sans', Roboto, Noto, 'Segoe UI', Arial, sans-serif;
            --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
            --primary: #0066fe;
            --secondary: #454545;
            --success: #53ca2b;
            --warning: #edc72a;
            --error: #ff5851;
            --social-link: #555;
            --disabled: rgba(192, 192, 192, 0.2);
            --breakpoint-m: 768px;
            --breakpoint-l: 1000px;
        }
        <%= if (style["theme"] == "light"){ %>
        :root {
            --background: #fff;
            --foreground: #111;
            --regular-text: #333;
            --social-link-hover: #111;
            --tag-color: #555;
        }
        <% } else if (style["theme"] == "dark") { %>
        :root {
            --background: #131619;
            --foreground: #f2f3f5;
            --regular-text: rgba(242, 243, 245, 0.6);
            --social-link-hover: var(--foreground);
            --tag-color: #888;
        }
        <% } else { %>
            :root {
                --background: #fff;
                --foreground: #111;
                --regular-text: #333;
                --social-link-hover: #111;
                --tag-color: #555;
            }
            @media (prefers-color-scheme: dark) {
                :root {
                    --background: #121313;
                    --foreground: #f2f3f5;
                    --tag-color: #888;
                    --regular-text: rgba(242, 243, 245, 0.6);
                    --social-link-hover: var(--foreground);
                }
            }
        <% } %>
        ::selection {
            color: #fff;
            background: #0066fe;
        }
        * {
            box-sizing: border-box;
        }
        html {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
        body {
            font-family: var(--font);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            background: var(--background);
            color: var(--foreground);
            margin: 0;
            font-size: 16px;
            line-height: 1.3;
            overflow-x: hidden;
        }
        .heading {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .heading.center {
            flex-flow: column;
        }
        header {
            position: relative;
            width: 100%;
            height: 60vh;
            margin-bottom: 32px;
        }
  
        header .cover {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        header .cover picture {
            height: 85vh;
            width: 100%;
            margin: 0 auto;
        }
        header .cover picture img {
            width: 100%;
            height: 100%;
            -o-object-fit: cover;
            font-family: "object-fit:cover";
            object-fit: cover;
        }
  
        @media screen and (min-width: 601px) {
            header {
                width: 100%;
                height: 85vh;
            }
            .heading.left {
                flex-flow: row;
            }
            .heading.right {
                flex-flow: row-reverse;
            }
            .heading.right header,
            .heading.left header {
                width: 50%;
                height: 100vh;
            }
            .heading.right .profile,
            .heading.left .profile {
                width: 50%;
            }
        }
        .profile {
            padding: 16px;
            display: flex;
            align-items: center;
            flex-flow: column;
        }
        .avatar {
            font-size: 0;
        }
        .avatar img {
            width: 120px;
            height: 120px;
            border-radius: 80px;
            border: 2px solid transparent;
            transition: all var(--transition)
        }
        .avatar img:hover {
            box-shadow: 0 1px 2px 0 rgba(0,0,0,.2), 0 2px 6px 2px rgba(0,0,0,.1);
        }
        h1 {
            font-size: 30px;
            line-height: 1.25;
            margin: 0 0 16px;
            font-weight: 400;
            color: var(--foreground);
        }
        h2 {
            font-size: 23px;
            line-height: 1;
            margin: 4px 0 8px;
            font-weight: 800;
            color: var(--foreground);
        }
        p {
            color: var(--regular-text);
            margin: 0 0 20px;
            font-size: 16px;
            font-weight: 400;
        }
        @media screen and (min-width: 601px) {
            .profile {
                padding: 32px;
            }
            .avatar img {
                width: 150px;
                height: 150px;
            }
        }
        .social {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.social a {
            color: var(--social-link);
			line-height: 0;
			margin: 0 8px 0;
			transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
		}
		.social a:hover {
            color: var(--social-link-hover);
        }
        .social svg {
            stroke: currentColor;
            stroke-width: 1.5;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .content-wrap {
            max-width: 800px;
            width: 100%;
            margin: 0 auto 64px;
            padding: 0 32px;
            text-align: left;
        }
        .content-wrap.center {
            text-align: center;
        }
        .content-wrap.right {
            text-align: right;
        }
        .content-wrap h2 {
            font-size: 30px;
            line-height: 1.25;
            margin: 0 0 16px;
            font-weight: 400;
        }
        .content-wrap p:empty {
            display: none;
        }
        .content-wrap p {
            font-size: 18px;
            line-height: 1.5;
        }
        .content-wrap p a {
            color: var(--primary);
            text-decoration: none;
        }
        .tags {
            display: inline-flex;
            margin-bottom: 20px;
        }
        .tag {
            color: var(--tag-color);
            margin-right: 1rem;
            padding: 6px 12px;
            border-radius: 5px;
            background: rgba(255, 255, 255, .06);
            box-shadow: 0 1px 2px 0 rgba(0,0,0,.04), 0 2px 6px 2px rgba(0,0,0,.08);
        }
        footer p {
            text-align: center;
            padding: 0 16px 64px;
            margin: 0;
        }
        .moul-collection {
            margin: 0px auto 64px;
            position: relative;
        }
        .moul-collection figure {
            margin: 0px;
        }
        .moul-collection figure a {
            display: block;
            font-size: 0;
            float: left;
        }
        .pswp__bg {
            background: #090a0b !important;
        }
    </style>
    <link rel="stylesheet" href="assets/moul.0c839.css">
</head>
<body>
<div id="moul">
    <div class="heading <%= style["cover"] %>">
        <%= if (isProd == true) { %>
            <%= if (len(cover["name"]) > 0) { %>
                <header>
                    <div class="cover">
                        <picture>
                            <source
                                media="(min-width: 1200px)"
                                data-srcset="photos/<%= cover["id"] %>/cover/2560/<%= cover["name"] %>.jpg"
                            >
                            <source
                                media="(min-width: 320px)"
                                data-srcset="photos/<%= cover["id"] %>/cover/1280/<%= cover["name"] %>.jpg"
                            >
                            <img
                                alt="cover"
                                class="lazyload"
                                src="<%= cover["sqip"] %>"
                            >
                        </picture>
                    </div>
                </header>
            <% } %>
        <% } else { %>
            <header>
                <div class="cover">
                    <picture>
                        <%= if (len(cover["name"]) > 0) { %>
                            <img
                                alt="cover"
                                class="lazyload"
                                src="photos/cover/<%= cover["name"] %>"
                            >
                        <% } else { %>
                            <img
                                alt="cover"
                                src="img/?width=2560&height=1280&title=Cover&text=Recommended 2:1 or 16:9 aspect ratio"
                            >
                        <% } %>
                    </picture>
                </div>
            </header>
        <% } %>

        <div class="profile">
            <%= if (isProd == true) { %>
                <%= if (len(avatar) > 0) { %>
                    <a href="photos/<%= avatar["id"] %>/avatar/512/<%= avatar["name"] %>.jpg" class="avatar">
                        <img
                            src="<%= avatar["sqip"] %>"
                            data-src="photos/<%= avatar["id"] %>/avatar/320/<%= avatar["name"] %>.jpg"
                            class="lazyload"
                            alt="<%= profile["name"] %>'s avatar">
                    </a>
                <% } %>
            <% } else { %>
                <%= if (len(avatar) > 0) { %>
                    <a href="photos/avatar/<%= avatar %>" class="avatar">
                        <img
                            src="photos/avatar/<%= avatar %>"
                            alt="<%= profile["name"] %> 's avatar">
                    </a>
                <% } else { %>
                    <a href="img/?width=512&height=512&title=Avatar&text=1:1" class="avatar">
                        <img
                            src="img/?width=450&height=450&title=Avatar&text=1:1"
                            alt="<%= profile["name"] %> 's avatar">
                    </a>
                <% } %>
            <% } %>
            <h2><%= profile["name"] %></h2>
            <p><%= profile["bio"] %></p>
            <div class="social">
                <%= if (len(social["twitter"]) > 0 ) { %>
                    <a href="https://twitter.com/<%= social["twitter"] %>">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                    </a>
                <% } %>
                <%= if (len(social["github"]) > 0 ) { %>
                    <a href="https://github.com/<%= social["github"] %>">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                <% } %>
                <%= if (len(social["instagram"]) > 0 ) { %>
                    <a href="https://www.instagram.com/<%= social["instagram"] %>">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                        </svg>
                    </a>
                <% } %>
                <%= if (len(social["youtube"]) > 0 ) { %>
                    <a href="https://www.youtube.com/<%= social["youtube"] %>">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                    </a>
                <% } %>
                <%= if (len(social["facebook"]) > 0 ) { %>
                    <a href="https://www.facebook.com/<%= social["facebook"] %>">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </a>
                <% } %>
            </div>
        </div>
    </div>
    <div class="content-wrap <%= style["content"] %>">
        <%= if (len(content["title"]) > 0) { %>
        <h1><%= content["title"] %></h1>
        <% } %>
        <%= if (len(content["tags"]) > 0) { %>
            <div class="tags">
            <%= for (tag) in content["tags"] { %>
                <span class="tag"><%= tag %></span>
            <% } %>
            </div>
        <% } %>
        <%= if (len(content["text"]) > 0) { %>
        <%= md(content["text"]) %>
        <% } %>
    </div>

    <div class="moul-collection moul-collection-0"></div>
    <input
        type="hidden"
        class="photo-collection photo-collection-0"
        data-cp="collection"
        value="<%= getPhotos("collection", slugName) %>">

    <%= for (v) in between(0,10) { %>
        <%= if (len(section) >= v) { %>
            <%= if ((len(section[toString(v)]["title"]) > 0) || (len(section[toString(v)]["description"]) > 0)){ %>
                <section class="content-wrap">
                    <%= if (len(section[toString(v)]["title"]) > 0) { %>
                        <h2><%= section[toString(v)]["title"] %></h2>
                    <% } %>

                    <%= if (len(section[toString(v)]["text"]) > 0) { %>
                        <p><%= md(section[toString(v)]["text"]) %></p>
                    <% } %>
                    <%= if (len(getPhotos(joinPath("section", toString(v)), slugName)) > 0) { %>
                        <input
                            type="hidden"
                            class="photo-collection photo-collection-<%= toString(v) %>"
                            <%= if (isProd == true) { %>
                                data-cp="<%= "section-" + toString(v) %>"
                            <% } else { %>
                                data-cp="<%= "section/" + toString(v) %>"
                            <% } %>
                            value="<%= getPhotos(joinPath("section", toString(v)), slugName) %>">
                    <% } %>
                </section>
                <div class="moul-collection <%= "moul-collection-" + toString(v) %>"></div>
            <% } %>
        <% } %>
    <% } %>
</div>

<footer>
    <p>Copyright © <%= profile["name"] %>. All Rights Reserved.</p>
</footer>

<input type="hidden" id="ga-measurement-id" value="<%= measurementId %>">
<input type="hidden" id="by" value="<%= by %>">

<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="pswp__bg"></div>
    <div class="pswp__scroll-wrap">
        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
            <div class="pswp__top-bar">
                <div class="pswp__counter"></div>
                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                <button class="pswp__button pswp__button--share" title="Share"></button>
                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
                </div>
            </div>
            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div> 
            </div>
            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
            </button>
            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
            </button>
            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>
        </div>
    </div>
</div>

<script src="assets/moul.0c839.js" defer></script>
<%= if (len(measurementId) > 0 ) { %>
<script async src="https://www.googletagmanager.com/gtag/js?id=<%= measurementId %>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '<%= measurementId %>');
</script>
<% } %>
</body>
</html>`
}
