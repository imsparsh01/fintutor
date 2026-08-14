export class RequestGeneration {
  private generation = 0;

  begin(): number { this.generation += 1; return this.generation; }
  cancel(): void { this.generation += 1; }
  isCurrent(candidate: number): boolean { return candidate === this.generation; }
}
