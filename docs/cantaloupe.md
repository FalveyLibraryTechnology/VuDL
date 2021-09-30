# Cantaloupe Setup Notes

The [Cantaloupe Image Server](https://cantaloupe-project.github.io/) is required when using [VuFind](https://vufind.org) as the front-end for your repository. In order to configure the server to display images from [Fedora Commons](https://duraspace.org/fedora/), it is only necessary to change a few settings from the defaults in cantaloupe.properties:

<pre>
source.static = HttpSource
HttpSource.BasicLookupStrategy.url_prefix = http://localhost:8080/rest/
HttpSource.BasicLookupStrategy.url_suffix = /LARGE
HttpSource.BasicLookupStrategy.auth.basic.username = yourFedoraUsername
HttpSource.BasicLookupStrategy.auth.basic.secret = yourFedoraPassword
</pre>

You should replace localhost:8080 with the hostname of your Fedora server (if necessary) and fill in appropriate credentials.

Other settings you may wish to consider adjusting include:

<pre>
max_pixels (to allow large images)
max_scale (to allow deeper zoom)
HttpSource.chunking.enabled (to optimize performance)
</pre>

You should also review caching and logging settings and make sure they are appropriate for your situation.