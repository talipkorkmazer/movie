import { PaginatedResult } from '@/common/types/paginated-result';
import { PaginationDto } from '@/common/dto/pagination.dto';

export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  options?: PaginationDto,
) => Promise<PaginatedResult<T>>;
