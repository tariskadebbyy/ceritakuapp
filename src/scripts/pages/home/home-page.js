export default class HomePage {
  async render() {
    return `
      <section class="container">
      <div class="header-container">
        <div class="title-container">
          <h1>Read or Create Story to Share with Others</h1>
          <p>Please share with a smile and the universe can feel the same way you do.</p>
          <div class="button-container">
            <a id="create-button" href="#/story">Create Story</a>
            <a id="read-button" href="#/list-story">Read Story</a>
          </div>
        </div>
        <div class="card-fan-container">
          <img src="./images/img1.jpg" alt="Title Image" class="fan-card fan-card-1" />
          <img src="./images/img2.jpg" alt="Title Image" class="fan-card fan-card-2" />
          <img src="./images/img3.jpg" alt="Title Image" class="fan-card fan-card-3" />
        </div>
      </div>
        
      </section>
    `;
  }

  async afterRender() {}
}
