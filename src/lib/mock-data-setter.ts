import { IDatabase } from "../db/db-interface";
import { encryption } from "./auth";

export const set = async (db: IDatabase) => {
	if (db) {
		const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec pellentesque nec urna eu volutpat. Duis sed auctor nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed at justo sed tellus accumsan aliquam. Nullam sollicitudin augue eu dolor vestibulum vulputate. Vivamus semper at ex vel sollicitudin. Nunc euismod nisi nec ipsum condimentum, sit amet convallis sem interdum. Proin sed tincidunt lacus, egestas facilisis neque. Sed mi libero, fringilla non accumsan ac, lacinia eu leo. Vestibulum a urna gravida, aliquet purus id, mollis felis. Suspendisse nec ex tempor, feugiat nibh at, ultricies dui. Nullam sit amet purus orci. Ut sollicitudin hendrerit lorem, eget maximus lacus feugiat eu. Duis sit amet quam ut tortor semper dignissim.

		Phasellus porta augue vitae tempus pretium. Curabitur in nisl vitae lacus malesuada egestas. Nulla a ante non odio pulvinar commodo eu eu dui. Quisque commodo elementum gravida. Proin risus velit, finibus sit amet tincidunt quis, cursus a turpis. Ut pretium urna quis nunc malesuada maximus. Suspendisse consequat dolor vestibulum gravida dapibus. Aliquam sit amet iaculis purus, vel porttitor nibh. Phasellus accumsan et massa non posuere. Vestibulum facilisis diam ac dolor ultricies auctor. Nulla interdum mattis erat sit amet aliquet. Curabitur pulvinar elit quis magna convallis, vel viverra nulla aliquet. Aenean efficitur aliquam sapien et iaculis. Donec scelerisque blandit lacus, vel pharetra justo molestie quis.
		
		Proin blandit augue in libero vehicula, ut maximus augue accumsan. Praesent suscipit erat et est pharetra, id gravida tellus maximus. Sed dictum ullamcorper convallis. Cras vel lacus ut lectus finibus porta. Aliquam dignissim id velit porta lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed augue arcu, maximus ut metus at, auctor mattis tellus. Maecenas mollis nunc urna, eu consectetur nisi dapibus non. Nunc luctus dictum tortor, vitae pellentesque enim iaculis et. Nulla nec consectetur erat. Aenean hendrerit, risus et vehicula accumsan, massa sapien semper enim, eu commodo leo nulla et diam. Phasellus nibh felis, tempor vitae erat ut, dictum fringilla nisl.
		
		Mauris malesuada, turpis quis blandit fringilla, sapien nisl luctus magna, ac blandit tellus enim in sapien. Quisque eu nulla a lacus luctus gravida. Aenean nulla diam, dapibus et dolor vitae, porta gravida ipsum. Donec malesuada ligula vitae dapibus gravida. In ornare condimentum eros eget interdum. Quisque enim velit, accumsan id dictum sed, iaculis et tellus. Donec vestibulum tincidunt purus. Suspendisse sit amet augue ac neque condimentum fermentum non vel quam. Donec facilisis turpis tellus, id laoreet nunc aliquet eu. Nulla vulputate finibus nisl.
		
		Pellentesque et imperdiet mi. Sed dignissim sed est in luctus. Sed malesuada massa eu vestibulum efficitur. Cras dapibus ex velit, ut convallis urna consequat sed. Aliquam nisi urna, euismod sollicitudin felis molestie, rutrum fermentum urna. Suspendisse eu dui ipsum. Duis congue diam eu odio scelerisque, et tincidunt ex porta. Vivamus turpis nunc, venenatis ut ullamcorper id, tincidunt quis arcu. Nulla posuere elit eu ipsum finibus, non semper tellus fringilla. Sed posuere velit urna, quis semper lectus volutpat sed. Nulla volutpat tortor a dui rutrum, quis condimentum ipsum fermentum. Duis scelerisque felis sit amet erat bibendum tempor. Phasellus sed lorem fringilla, faucibus purus id, pellentesque leo. Aliquam vestibulum volutpat lacus. Quisque tortor diam, aliquam sit amet auctor ut, fringilla nec leo. Donec a ligula magna.`;
		const names = [
			"Boas", "Gebuhr", "Hayle", "Rottery", "Eriksson", "Hembling",
			"Kopmann", "Bruhn", "Chifney", "Leyzell", "Knewstub", "Mussilli",
			"O' Hern", "McPhail", "Bleue", "Stimson", "Eggar", "Whitehorne",
			"Luckman", "Chezelle", "Habbin", "Hazeup", "McQuaid", "Keeffe",
			"Freckingham", "Hayesman", "Faulks", "Brydone", "Pachmann",
			"McGovern", "Howford", "Petters", "Estevez", "Loadwick", "McGowran",
			"Pabelik", "Gerrad", "Tomovic", "Bratten", "Churchard", "Barstock",
			"Grund", "Greed", "Caldicott", "Vannuccinii", "Grote", "MacBean",
			"Seelbach", "Grgic", "Deeprose", "Gowers", "Antoinet", "Yelden",
			"Voller", "Megroff", "Chalkly", "Bucknill", "Bartoshevich",
			"Colgrave", "Davidof", "Seemmonds", "Rubens", "Stolting", "Dymocke",
			"McKue", "Kroll", "Pancast", "Goadbie", "Wedlock", "Ackerley",
			"O'Kuddyhy", "Gawthorpe", "Carrodus", "Nestoruk", "Kemmet",
			"Lardnar", "Rounsefell", "Mogra", "Poytres", "Heffy", "Bigmore",
			"Narducci", "Rawcliff", "Harnes", "Cossum", "Dulton", "Baudassi",
			"Kinvan", "Clacson", "Honnan", "Spellacy", "Melsome", "Dunnett",
			"Loveguard", "Akrigg", "Osman", "Inglish", "Lovering", "Size",
			"Khomishin"];
		const boardSeminar = await db.findBoardByTitle("세미나");
		const boardHomework = await db.findBoardByTitle("과제");
		const boardWork = await db.findBoardByTitle("신입생 자료실");
		const admin = await db.findUserBySID("root");

		for (let i = 1; i <= 100; i++) {
			if (boardSeminar) {
				db.createPost(boardSeminar.getTitle() + " 게시물" + i,
					loremIpsum, boardSeminar.getId(), [], admin.getId());
			}
			if (boardHomework) {
				db.createPost(boardHomework.getTitle() + " 게시물" + i,
				loremIpsum, boardHomework.getId(), [], admin.getId());
			}
			if (boardWork) {
				db.createPost(boardWork.getTitle() + " 게시물" + i,
				loremIpsum, boardWork.getId(), [], admin.getId());
			}
		}

		let sid = 123123;
		names.forEach(async (name: string, idx: number) => {
			const authInfo = await encryption("1234");
			await db.createUser(name, String(sid++), authInfo[0], authInfo[1], idx >= 50 ? "신입생" : "재학생");
		});
	}
};
