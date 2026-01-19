export default interface Mapper<DomainEntity, DbRecord, ResponseDto> {
  toPersistenceFromDomain(entity: DomainEntity): DbRecord;
  toDomainFromPersistence(record: DbRecord): DomainEntity;
  toResponseFromDomain(entity: DomainEntity): ResponseDto;
}
