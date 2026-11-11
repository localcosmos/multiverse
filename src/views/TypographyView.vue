<template>
  <main class="typography-view">
    <section class="type-sample">
      <h1>Heading Level 1 (H1)</h1>
      <p>
        This is body text beneath an H1 heading. Use this page to verify type scale, spacing, and
        readability across different screen sizes.
      </p>
    </section>

    <section class="type-sample">
      <h2>Heading Level 2 (H2)</h2>
      <p>
        This paragraph helps test paragraph rhythm and line height with H2 headings in normal
        content flow.
      </p>
    </section>

    <section class="type-sample">
      <h3>Heading Level 3 (H3)</h3>
      <p>
        Another body text example for checking consistency between heading levels and default
        paragraph styles.
      </p>
    </section>

    <section class="type-sample">
      <h4>Heading Level 4 (H4)</h4>
      <p>
        This sample is here to verify the smallest heading style in the main typography scale and
        how it pairs with body text.
      </p>
    </section>

    <section class="type-sample">
      <p>
        Standalone body text sample: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at
        nibh elementum imperdiet.
      </p>
      <p>
        Second paragraph sample: Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue
        semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
      </p>
    </section>
  </main>
</template>

<style scoped>
.typography-view {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  margin-top: 100px;
}

.type-sample + .type-sample {
  margin-top: 2rem;
}

h1,
h2,
h3,
h4 {
  margin: 0 0 0.75rem;
}

p {
  margin: 0;
  line-height: 1.6;
}

p + p {
  margin-top: 1rem;
}
</style>
