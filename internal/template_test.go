package internal_test

import (
	"strings"
	"testing"

	"github.com/moul-co/moul/internal"
)

func TestContentRender(t *testing.T) {
	content := `{"$$mdtype":"Tag","name":"article","attributes":{},"children":[{"$$mdtype":"Tag","name":"cover","attributes":{},"children":[{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"cpan9pro7x8d"},"children":[]}]},{"$$mdtype":"Tag","name":"title","attributes":{},"children":[{"$$mdtype":"Tag","name":"p","attributes":{},"children":["Sunset at its finest."]}]},{"$$mdtype":"Tag","name":"p","attributes":{},"children":["Angkor archaeological park is known for lost ruins, abundant ancient temples."]},{"$$mdtype":"Tag","name":"p","attributes":{},"children":["But one thing that we can't deny is how magnificent the sunset around the temple complex. Do not take my words for it, see for yourself."]},{"$$mdtype":"Tag","name":"grid","attributes":{},"children":[{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"wqpuy9ebkcpf"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"g29yj7bvshfl"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"epczi7m1l5by"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"95mzxl38ijw4"},"children":[]}]},{"$$mdtype":"Tag","name":"p","attributes":{},"children":["After I got above photos, I decided to go next day as well. And oh, did I make the right decision!!!"]},{"$$mdtype":"Tag","name":"grid","attributes":{},"children":[{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"ow408totjiyg"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"ordkmba6zmft"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"kg7e7iq5y965"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"8jtn15nrx3e1"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"3xidav196d9w"},"children":[]}]},{"$$mdtype":"Tag","name":"p","attributes":{},"children":["It looks like straight out of a magical world to me. I didn't stop there, the next day I went to the same area."]},{"$$mdtype":"Tag","name":"grid","attributes":{},"children":[{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"qhhbm1v4lo0a"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"bn4a1e50rfio"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"egngp4j3s6wd"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"7kdy194lyeze"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"6efx6qzxldrl"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"wmq8havjuhzd"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"ogh7svfi35ww"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"zynku7jpwp7f"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"idhngbs85tle"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"0fdagc10ti3m"},"children":[]}]},{"$$mdtype":"Tag","name":"p","attributes":{},"children":["Well, guess what? I went to that place again!"]},{"$$mdtype":"Tag","name":"grid","attributes":{},"children":[{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"wb658vwskp6w"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"vzi070s6p562"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"tz1y3od8fdha"},"children":[]},{"$$mdtype":"Tag","name":"photo","attributes":{"pid":"pnles5aumvct"},"children":[]}]},{"$$mdtype":"Tag","name":"blockquote","attributes":{},"children":[{"$$mdtype":"Tag","name":"p","attributes":{},"children":["There are no post-processing done in all above photos. It is straight out of camera (SOOC)."]}]}]}`
	rendered, _ := internal.RenderContent(content)
	if !strings.Contains(rendered, "cpan9pro7x8d") {
		t.Error("Couldn't render story cover")
	}

	if !strings.Contains(rendered, "Angkor archaeological park is known for lost ruins") {
		t.Error("Couldn't render paragraph")
	}

	if !strings.Contains(rendered, "There are no post-processing done in all above photos") {
		t.Error("Couldn't render blockquote")
	}
}
