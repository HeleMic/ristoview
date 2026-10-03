export type Route =
  | { name: 'gift' }
  | { name: 'restaurants' }
  | { name: 'restaurant'; id: string }
  | { name: 'new' }
  | { name: 'review'; restaurantId: string; reviewId?: string }
  | { name: 'restaurant-edit'; id: string }
  | { name: 'settings' };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case 'ristoranti':
      if (parts[1] && parts[2] === 'modifica') return { name: 'restaurant-edit', id: parts[1] };
      if (parts[1] && parts[2] === 'recensione') {
        return { name: 'review', restaurantId: parts[1], reviewId: parts[3] };
      }
      return parts[1] ? { name: 'restaurant', id: parts[1] } : { name: 'restaurants' };
    case 'nuova':
      return { name: 'new' };
    case 'impostazioni':
      return { name: 'settings' };
    default:
      return { name: 'gift' };
  }
}

export const paths = {
  gift: '#/',
  restaurants: '#/ristoranti',
  restaurant: (id: string) => `#/ristoranti/${encodeURIComponent(id)}`,
  restaurantEdit: (id: string) => `#/ristoranti/${encodeURIComponent(id)}/modifica`,
  review: (restaurantId: string, reviewId?: string) =>
    `#/ristoranti/${encodeURIComponent(restaurantId)}/recensione${reviewId ? `/${encodeURIComponent(reviewId)}` : ''}`,
  new: '#/nuova',
  settings: '#/impostazioni',
};

class Router {
  route = $state<Route>(parse(location.hash));

  constructor() {
    window.addEventListener('hashchange', () => {
      this.route = parse(location.hash);
      window.scrollTo({ top: 0 });
    });
  }

  go(path: string, replace = false): void {
    if (replace) {
      history.replaceState(null, '', path);
      this.route = parse(path);
      window.scrollTo({ top: 0 });
    } else {
      location.hash = path;
    }
  }
}

export const router = new Router();
