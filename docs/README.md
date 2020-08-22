# Docs

## Example `moul.toml`

```toml
# The HTML base element specifies the base URL to use for all relative URLs in a document.
# Default to `/`
base = "/"

# Google Analytics tracking code.
# Eg: G-J8D3EXF6JH or UA-133159807-2
ga_measurement_id = ""

# Default to false, if true, below files are expected.
# `favicon/favicon.svg`
# `favicon/favicon-dark.png`
# `favicon/favicon-light.png`
# see example
favicon = "true"

# Control the style of the page.
[style]
theme = "system-preference" # possible value "system-preference | dark | light"
cover = "center" # possible value "left | center | right"
content = "left" # possible value "left | center | right"

# Profile information
[profile]
name = "Sophearak Tha"
bio = "Internetrovert • Indie Dev • Minimalist"

# Social media handle
[social]
twitter = ""
github = ""
instagram = ""
youtube = ""
facebook = ""

# The content of the page
[content]
title = "Primary title"
tags = ["Adventure", "Landscape"]
text = """
text
"""

# Additional content
# Photos should be place in `photos/section/1`, `photos/section/2` accordingly
[section.1]
title = "another title"
text = """
another text
"""
[section.2]
title = "yet another title"
text = """
another text
"""
```
