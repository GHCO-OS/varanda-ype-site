# Cobertura por CEP e consentimento

Após o consentimento geral de cookies, o site oferece uma consulta opcional de CEP. O CEP só é enviado quando a pessoa marca a autorização específica para verificar a cobertura. A API consulta ViaCEP e geocodificação pública do OpenStreetMap para classificar a distância aproximada até o restaurante (até 5 km, acima de 5 km ou não disponível).

O CEP informado voluntariamente é armazenado em `coverage_consents` para o propósito de cobertura de entrega. Recusas ficam em `coverage_consent_events` sem CEP. A planilha `Dados web - varandaype.com` está preparada com as abas `Cobertura CEP` e `Resumo de consentimento`; a sincronização automática exige uma credencial de serviço do Google Sheets ou um webhook Apps Script, que ainda não está configurado no Pages Function.

O resultado não presume compra e não dispara `purchase`. Dentro de 5 km, o usuário recebe a opção de pedido direto no almoço e retirada; fora da área, recebe iFood, 99Food e visita à loja.
