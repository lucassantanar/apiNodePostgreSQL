const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  let data;  
  console.log(req.body.id_medico);
  console.log(req.body.dat_agenda_i);
  console.log(req.body.dat_agenda_f);
  const { Pool } = require("pg");
  const pool = new Pool({
    user: "postgres",
    host: "192.168.0.153",
    database: "boechat",
    password: "juizladrao",
    port: 5432,
  });

  pool.query(`SELECT B.nom_medico, B.nom_guerra, 
  CAST(to_char(dat_marcacao, 'DD/MM/YY HH24:MI:SS') AS VARCHAR(20)) AS dat_marcacao, 
    A.chave, A.id_medico, A.cod_paciente, A.id_convenio, A.des_hora, A.ind_status, A.mem_obs, A.ind_bloqueado, A.hor_chegada, A.id_status_personalizado, 
    A.ind_sessao, A.num_sessao, A.total_sessao, A.ind_encaixe, A.dat_agenda, A.ind_uso, A.hor_atendimento, 
    A.dat_recebimento, A.num_guia, A.des_plano_tiss, A.qtd_sessao, A.des_detalhe_modalidade, A.ind_categoria, A.ind_primeira_consulta, 
    A.id_usuario, A.id_usuario_marca, A.ind_desmarcou, A.id_local, A.id_sala, A.num_autorizacao, 
    A.ind_horario_vip, A.id_profissional_aparelho, P.cod_procedimento, P.des_procedimento, P.val_procedimento, A.dat_validade_autorizacao, A.nom_medico_solicitante, 
    CAST(P.qtd_procedimento AS INTEGER) AS int_qtd_procedimento, 
  C.nom_convenio AS "Convênio",  
         F.nom_paciente AS "Paciente", F.num_ddd1, F.num_telefone1, 
         F.des_plano_comp, F.num_ddd2, F.num_telefone2, G.nom_usuario, F.num_prontuario, 
         F.dat_nascimento,F.dat_validade, F.num_matricula, C.ind_particular, F.des_operadora_cel, 
         C.ind_impressao_guia_tiss, C.ind_usar_tiss, 
         H.nom_usuario AS usuconf, I.nom_usuario AS usumarcou, 
         CAST(L.des_local AS varchar(50)) AS Local, 
         (select sum(val_procedimento) from arq_agenda_procedimento where chave=A.chave) AS val_proc, 
         F.nom_paciente_completo AS "PacienteCompleto", 
        CAST(CASE  
             WHEN EXTRACT('year' FROM age(F.dat_nascimento)) <= 04 THEN '4' 
             WHEN EXTRACT('year' FROM age(F.dat_nascimento)) >= 80 THEN '8' 
             WHEN (F.ind_preferencial = TRUE) AND (COALESCE(F.dat_preferencial_ate,CURRENT_DATE) >= CURRENT_DATE) THEN 'P' 
             WHEN (EXTRACT('year' FROM age(F.dat_nascimento)) >= (60)) THEN '6' 
             ELSE ' 'END AS varchar(1)) AS ind_preferencial_imagem, 
         CAST(REPLACE(REPLACE(A.mem_obs,CHR(13),''),CHR(10),'') AS VARCHAR(100)) AS novo_obs, 
         CAST(REPLACE(REPLACE(F.mem_obs,CHR(13),''),CHR(10),'') AS VARCHAR(100)) AS novo_obs_paciente, 
         CAST((SELECT 'S' FROM arq_agendal aa WHERE aa.cod_paciente = A.cod_paciente AND aa.dat_pendencia IS NOT NULL LIMIT 1) as varchar(10)) AS paciente_tem_pendencia, 
         (SELECT CAST(COUNT(*) AS INTEGER) FROM arq_arquivos_paciente aap WHERE aap.cod_paciente = A.cod_paciente AND aap.ind_excluido = FALSE LIMIT 1) AS arquivo_digital_paciente, 
         CAST(tp.nom_profissao as varchar(50)) AS nom_profissao, 
         tps.des_situacao AS situacao_paciente, tps.cor_fundo AS cor_fundo_sit_paciente, tps.cor_fonte AS cor_fonte_sit_paciente, 
         CAST(ti.des_indicacao as varchar(30)) AS indicacao_paciente, 
         CAST( CASE WHEN A.val_dinheiro    > 0 THEN '(DI)' ELSE '' END || 
               CASE WHEN A.val_cartao      > 0 THEN '(CA)' ELSE '' END || 
               CASE WHEN A.val_cheque      > 0 THEN '(CH)' ELSE '' END || 
               CASE WHEN A.val_promissoria > 0 THEN '(PR)' ELSE '' END || 
               CASE WHEN A.val_boleto      > 0 THEN '(BO)' ELSE '' END || 
               CASE WHEN A.val_transferencia > 0 THEN '(TR)' ELSE '' END || 
          
               CASE WHEN A.val_pag_outros  > 0 THEN '(OU)' ELSE '' END AS VARCHAR(25)) AS formas_pagamento, 
         CAST(am.nom_medico as varchar(50)) AS MedicoExecutante, 
         CAST((SELECT CAST(COUNT(*) as integer) FROM arq_agendal AS al WHERE 
             (al.ind_sessao = A.ind_sessao) AND 
             ((COALESCE (al.ind_status, ' ') IN (' ', 'C')) OR ((al.ind_status = 'F') AND (al.ind_desistencia_justificada = TRUE)))) AS varchar(20)) AS creditos_sessoes, 
         A.ind_tipo_consulta, A.ind_tipo_exame, 
         CAST(REPLACE(CAST(date_trunc('year', age(F.dat_nascimento)) AS VARCHAR), 'year', 'ano') AS VARCHAR(10)) AS idade_paciente, 
         F.des_email AS email_paciente, J.nom_usuario AS usuatendimento, F.des_endereco, K.nom_usuario AS usuchegou, 
         CAST(REPLACE(REPLACE(A.mem_autorizacao,CHR(13),''),CHR(10),'') AS VARCHAR(100)) AS novo_obs_autorizacao, 
         CAST(F.des_bairro AS varchar(50)) AS des_bairro, A.num_n_fiscal, F.nom_social, 
         CAST (CASE WHEN ind_tipo_desconto = 'p' THEN trim(to_char(A.val_desconto,'99G990D00'))||' %' ELSE ' ' || trim(to_char(A.val_desconto,'99G990D00')) END AS VARCHAR(15)) AS desconto, 
         F.ind_vip AS ind_vip_paciente, 
         CAST(COALESCE('Resp.: '||F.nom_resp||' ','')||COALESCE('Mãe: '||F.nom_mae||' ','')||COALESCE('Pai: '||F.nom_pai||' ','') AS VARCHAR(200)) AS resp_mae_pai, 
         tsp.des_status_personalizado 

         FROM arq_agendal A 
         LEFT JOIN tab_convenio C ON C.id_convenio = A.id_convenio  
         INNER JOIN arq_medico B ON A.id_medico= B.id_medico 
         LEFT JOIN arq_paciente F ON A.cod_paciente=F.cod_paciente 
         LEFT JOIN tab_senha G ON A.id_usuario=G.id_usuario 
         LEFT JOIN tab_senha AS H ON A.id_usuario_confirma=H.id_usuario 
         LEFT JOIN tab_senha AS I ON A.id_usuario_marca=I.id_usuario 
         LEFT JOIN tab_senha AS J ON A.id_usuario_atendimento = J.id_usuario 
         LEFT JOIN tab_senha AS K ON A.id_usuario_liberou = K.id_usuario 
         LEFT JOIN tab_empresa_locais L ON A.id_local = L.id_local 
         LEFT JOIN arq_caixa M ON A.chave=M.chave 
         LEFT JOIN tab_status_personalizado tsp ON A.id_status_personalizado = tsp.id_status_personalizado 
         LEFT JOIN tab_indicacao ti ON F.id_indicacao = ti.id_indicacao 
         LEFT JOIN arq_agenda_procedimento P ON P.chave=A.chave AND P.ind_procedimento NOT IN ('2','3') 
         LEFT JOIN arq_medico am ON A.id_profissional_aparelho = am.id_medico 
         LEFT JOIN tab_profissao tp ON F.cod_profissao = tp.cod_profissao 
         LEFT JOIN tab_paciente_situacao tps ON F.ind_situacao = tps.ind_situacao 
         WHERE (A.id_medico=45)  AND (A.dat_agenda between 2021-04-01 and 2021-04-15) ORDER BY A.int_ordem_agenda, A.dat_agenda,A.des_hora`,
    (err, { rows }) => {
      try {
        data = JSON.stringify(rows);
        res.send(data);
        pool.end();
      } catch {
        console.log(err)
      }

    }
  ); 
});

app.listen(1483, '0.0.0.0',() => console.log("Sevidor executando em: http://localhost:1483"));

