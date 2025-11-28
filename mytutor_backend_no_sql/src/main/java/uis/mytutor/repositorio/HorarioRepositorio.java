package uis.mytutor.repositorio;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import uis.mytutor.modelo.Horario;

import java.time.LocalDateTime;
import java.util.List;

public interface HorarioRepositorio extends MongoRepository<Horario, String> {
    List<Horario> findByDisponibleTrue();

    List<Horario> findByDisponibleTrueAndFechaInicioBefore(LocalDateTime fecha);

    List<Horario> findByIdTutor(String idTutor);

    @Query(value = "{ 'idTutor': ?0, 'fechaInicio': { $lt: ?2 }, 'fechaFin': { $gt: ?1 } }")
    List<Horario> encontrarHorariosSolapados(String idTutor, LocalDateTime fechaInicio, LocalDateTime fechaFin);

}