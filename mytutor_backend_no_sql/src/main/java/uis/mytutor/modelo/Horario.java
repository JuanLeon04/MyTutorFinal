package uis.mytutor.modelo;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "horario")
public class Horario {

    @Id
    private String id;  // En MongoDB el ID es un String (ObjectId)

    @NotNull
    private String idTutor;

    @NotNull
    private LocalDateTime fechaInicio;

    @NotNull
    private LocalDateTime fechaFin;

    @NotNull
    private boolean disponible = true;

    private List<Reserva> historialReservas;

}
