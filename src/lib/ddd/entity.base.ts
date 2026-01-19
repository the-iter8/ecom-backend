import { SafeParseReturnType } from "zod";

export interface EntityProps {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export default abstract class Entity<T extends EntityProps> {
  protected props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract validate(): SafeParseReturnType<T, T>;

  getProps(): T {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  equals(entity: Entity<T>): boolean {
    return this.props.id === entity.props.id;
  }
}
