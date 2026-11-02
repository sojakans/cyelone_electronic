alter table public.products add column robot_part text check(robot_part in ('uno','driver','motors','wheels','chassis','sensor','servo','battery','holder','wires','switch','hardware','bluetooth','line')), add column is_bestseller boolean not null default false;
create unique index products_robot_part_unique on public.products(robot_part) where robot_part is not null;
update public.categories set name='Arduino boards and accessories' where slug='arduino-boards';
update public.categories set name='Sensors and modules' where slug='sensors';
update public.categories set name='Motor drivers' where slug='modules';
update public.categories set name='Breadboards and jumper wires' where slug='wires-breadboards';
update public.categories set name='Soldering tools' where slug='tools';
insert into public.categories(name,slug,sort_order) values ('ESP32 and ESP8266','esp32-esp8266',6),('Raspberry Pi','raspberry-pi',7),('Robotics chassis and kits','robotics-kits',8),('DC, servo, and stepper motors','motors',9),('Batteries and power supplies','power-supplies',10),('LEDs and displays','leds-displays',11),('Switches, relays, and connectors','switches-relays',12),('ICs, transistors, and diodes','semiconductors',13),('PCB development tools','pcb-tools',14),('IoT modules','iot-modules',15),('Robotics accessories','robotics-accessories',16);
