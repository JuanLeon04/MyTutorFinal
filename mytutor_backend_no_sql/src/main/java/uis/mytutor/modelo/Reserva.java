package uis.mytutor.modelo;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @NotNull
    private String idUsuario; // id del usuario que reservó

    public enum EstadoReserva {
        PENDIENTE,
        CANCELADA,
        COMPLETADA,
        NO_ASISTIO,
        ESPERANDO_ACCION_TUTOR
    }

    @NotNull
    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    @NotNull
    private LocalDateTime fecha = LocalDateTime.now();
}
