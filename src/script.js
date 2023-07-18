import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '38310547-46b116b28ccce7cbd05875092';
let currentPage = 1;

function getSmallImageUrl(image) {
  return image.webformatURL;
}

function getLargeImageUrl(image) {
  return image.largeImageURL;
}

function renderImageCards(images) {
  const gallery = document.querySelector('.gallery');

  images.forEach(image => {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const imageElement = document.createElement('img');
  imageElement.src = getSmallImageUrl(image);
  imageElement.alt = image.tags;
  imageElement.loading = 'lazy';

  imageElement.addEventListener('click', () => {
    const largeImageUrl = getLargeImageUrl(image);
    openModalWithImage(largeImageUrl);
  });

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.append(likes, views, comments, downloads);
  card.append(imageElement, info);

  return card;
}

function openModalWithImage(imageUrl) {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  const modalImage = document.createElement('img');
  modalImage.src = imageUrl;
  modalImage.alt = 'Large Image';

  modal.appendChild(modalImage);

  document.body.appendChild(modal);

  modal.addEventListener('click', () => {
    closeModal();
  });
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
  }
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}: </b>${value}`;

  return item;
}

async function fetchImages(searchQuery, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: 40,
      },
    });

    return response.data.hits;
  } catch (error) {
    console.log(error);
    throw new Error('fail');
  }
}

async function searchImages(event) {
  event.preventDefault();

  const searchForm = event.currentTarget;
  const searchInput = searchForm.elements.searchQuery;
  const searchQuery = searchInput.value.trim();

  if (searchQuery === '') {
    return;
  }

  try {
    currentPage = 1;
    const images = await fetchImages(searchQuery);
    renderImageCards(images);

    if (images.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    searchInput.value = '';
    showLoadMoreButton();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Error');
  }
}

async function loadMoreImages() {
  const searchInput = document.querySelector('input[name="searchQuery"]');
  const searchQuery = searchInput.value.trim();

  try {
    const images = await fetchImages(searchQuery, currentPage + 1);
    if (images.length === 0) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      hideLoadMoreButton();
    } else {
      currentPage++;
      renderImageCards(images);
    }
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Error');
  }
}

function showLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'none';
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', searchImages);

const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.addEventListener('click', loadMoreImages);
