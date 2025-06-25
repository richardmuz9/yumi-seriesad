import type { CrossrefResponse } from '../../../types/shared';

return (response.data as CrossrefResponse).message.items.map(this.mapCrossrefToCitation); 